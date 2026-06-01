// apps/backend/src/routes/intel.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// GET all historical threats for the UI
router.get('/threats', async (req: Request, res: Response) => {
  const { data: threats, error } = await supabase
    .from('threats')
    .select('*')
    .order('published_date', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Intel Agent] DB Error:', error);
    return res.status(500).json({ error: 'Failed to fetch threat intel' });
  }

  res.json(threats);
});

// LIVE MULTI-AGENT HANDOFF: DevSecOps -> Intel -> OSV.dev
router.post('/analyze-dependencies', async (req: Request, res: Response) => {
  const io = (req as any).io;
  const { dependencies } = req.body; 

  if (!dependencies || !Array.isArray(dependencies)) {
    return res.status(400).json({ error: 'Dependencies array required' });
  }

  console.log(`[Intel Agent] Cross-referencing ${dependencies.length} dependencies against OSV.dev...`);

  let newThreatsDetected = [];

  try {
    for (const dep of dependencies) {
      // Clean version strings (e.g., "^4.17.1" -> "4.17.1")
      const cleanVersion = dep.version.replace(/[\^~]/g, '');

      // Query the official OSV.dev API
      const osvResponse = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: cleanVersion,
          package: { name: dep.name, ecosystem: 'npm' }
        })
      });

      if (!osvResponse.ok) continue;
      
      const osvData = await osvResponse.json();

      if (osvData.vulns && osvData.vulns.length > 0) {
        for (const vuln of osvData.vulns) {
          // Extract CVE (usually listed in aliases) or fallback to OSV ID
          const cveId = vuln.aliases?.find((a: string) => a.startsWith('CVE')) || vuln.id;
          
          // Determine severity (OSV sometimes hides this in database_specific)
          const severityRaw = vuln.database_specific?.severity || 'HIGH';
          const severity = severityRaw === 'MODERATE' ? 'MEDIUM' : severityRaw;

          const threatData = {
            cve: cveId,
            severity: severity,
            title: vuln.summary || vuln.details?.substring(0, 60) + '...' || 'Vulnerability detected',
            affected_package: `${dep.name}@${cleanVersion}`,
            published_date: new Date(vuln.published || new Date()).toISOString(),
            cvss: severity === 'CRITICAL' ? 9.8 : severity === 'HIGH' ? 8.1 : 6.5
          };

          // Upsert into Supabase (Requires the unique constraint on the 'cve' column)
          const { data: savedThreat, error: upsertError } = await supabase
            .from('threats')
            .upsert(threatData, { onConflict: 'cve' })
            .select()
            .single();

          if (upsertError) {
            console.error(`[Intel Agent] Supabase Upsert Error for ${cveId}:`, upsertError);
            continue; // Skip broadcasting if the DB transaction fails
          }

          newThreatsDetected.push(savedThreat);

          // 1. Broadcast to the Threat Intel UI
          io.emit('new_cve_threat', savedThreat);

          // 2. Alert the Nexus Orchestrator to calculate composite risk
          io.emit('agent_event', {
            id: savedThreat.id,
            type: savedThreat.severity === 'CRITICAL' ? 'error' : 'warning',
            agent: 'Intel Agent',
            message: `[OSV.dev LIVE] Active exploit found in repository dependency: ${savedThreat.affected_package} (${cveId})`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }



    res.json({ success: true, threatsFound: newThreatsDetected.length, details: newThreatsDetected });

  } catch (error: any) {
    console.error('[Intel Agent] OSV API Failure:', error);
    res.status(500).json({ error: 'Failed to query threat intelligence feeds' });
  }
});

// Endpoint for "Force Agent Sync" button
router.post('/simulate', async (req: Request, res: Response) => {
  const io = (req as any).io;
  
  const lastScan = (global as any).lastScannedRepo;

  if (!lastScan || !lastScan.vulnerabilities || lastScan.vulnerabilities.length === 0) {
    return res.json({ success: true, message: 'No vulnerabilities found in the last repo scan to sync.' });
  }

  let syncedCount = 0;
  
  try {
    for (let i = 0; i < lastScan.vulnerabilities.length; i++) {
      const vuln = lastScan.vulnerabilities[i];
      
      const threatData = {
        // Generate a unique ID for this AST vulnerability
        cve: `AST-VULN-${i}-${Date.now().toString().slice(-4)}`,
        severity: vuln.severity,
        title: `[Code Sec] ${vuln.title}`,
        affected_package: `${vuln.file} (Line ${vuln.line || '?'})`,
        published_date: new Date().toISOString(),
        cvss: vuln.severity === 'CRITICAL' ? 9.8 : vuln.severity === 'HIGH' ? 8.1 : 5.0
      };

      const { data: savedThreat, error } = await supabase
        .from('threats')
        .upsert(threatData, { onConflict: 'cve' })
        .select()
        .single();

      if (!error && savedThreat) {
        syncedCount++;
        io.emit('new_cve_threat', savedThreat);
        io.emit('agent_event', {
          id: savedThreat.id,
          type: savedThreat.severity === 'CRITICAL' ? 'error' : 'warning',
          agent: 'DevSecOps Agent',
          message: `Synced AST vulnerability to Threat DB: ${savedThreat.title}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({ success: true, synced: syncedCount });
  } catch (err) {
    console.error('[Intel Agent] Sync DB Error:', err);
    res.status(500).json({ error: 'Failed to sync repo vulnerabilities' });
  }
});

export default router;
