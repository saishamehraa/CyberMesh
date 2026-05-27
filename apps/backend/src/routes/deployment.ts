// apps/backend/src/routes/deployment.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// GET all deployments for the UI
router.get('/', async (req: Request, res: Response) => {
  const { data: deployments, error } = await supabase
    .from('deployments')
    .select(`
      *,
      checks:deployment_checks(*)
    `)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('[DB Error]', error);
    return res.status(500).json({ error: 'Failed to fetch deployments' });
  }

  res.json(deployments);
});

// POST a new pending deployment
router.post('/trigger', async (req: Request, res: Response) => {
  const io = (req as any).io;
  const { name, branch } = req.body;
  
  // 1. Insert the parent deployment
  const { data: deployment, error: depError } = await supabase
    .from('deployments')
    .insert({
      name: name || 'release/v1.2.0-core',
      branch: branch || 'main',
      status: 'PENDING',
      score: 100
    })
    .select()
    .single();

  if (depError) return res.status(500).json({ error: depError.message });

  // 2. Insert the child checks
  const { data: checks, error: checksError } = await supabase
    .from('deployment_checks')
    .insert([
      { deployment_id: deployment.id, name: 'Prompt Security', status: 'pending', message: 'Awaiting Gateway...', agent: 'Gateway' },
      { deployment_id: deployment.id, name: 'Threat Intelligence', status: 'pending', message: 'Scanning...', agent: 'Intel' },
      { deployment_id: deployment.id, name: 'Code Security', status: 'pending', message: 'Running AST analysis...', agent: 'DevSecOps' },
      { deployment_id: deployment.id, name: 'Runtime Health', status: 'pending', message: 'Verifying production topology...', agent: 'Runtime' }
    ])
    .select();

  if (checksError) return res.status(500).json({ error: checksError.message });

  const newDeployment = { ...deployment, checks };

  // 3. Broadcast to UI
  io.emit('deployment_new', newDeployment);

  // 4. Autonomous Mesh Decision!
  const lastScan = (global as any).lastScannedRepo;
  if (lastScan && lastScan.hasCritical) {
    // If the repo had critical vulns, trigger an autonomous block after 3 seconds
    setTimeout(() => {
      io.emit('orchestration_action', {
        id: Date.now().toString(),
        type: 'error',
        agent: 'DevSecOps Agent',
        message: `deployment block CRITICAL: DevSecOps Agent isolated ${lastScan.vulnerabilities.length} vulnerabilities in ${lastScan.repoUrl.split('/').pop()}. Reason: ${lastScan.vulnerabilities[0]?.title || 'Code risk'}`,
        timestamp: new Date()
      });
    }, 3000);
  }

  res.json({ success: true, deployment: newDeployment });
});

export default router;
