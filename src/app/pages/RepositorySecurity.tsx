// apps/frontend/src/app/pages/RepositorySecurity.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, FileCode, AlertTriangle, CheckCircle, XCircle, Loader2, Github, Zap } from 'lucide-react';

interface ScanResult {
  status: 'scanning' | 'complete';
  files: number;
  vulnerabilities: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    file: string;
    line: number;
    recommendation: string;
  }>;
  dependencies: Array<{
    name: string;
    version: string;
    vulnerabilities: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  }>;
}

export function RepositorySecurity() {
  const [repoUrl, setRepoUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!repoUrl.includes('github.com')) {
      setScanError('Please enter a valid GitHub repository URL.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanResult(null); // Clear previous results

    try {
      const response = await fetch('/api/devsecops/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      setScanResult(data);
      
      if (data.dependencies && data.dependencies.length > 0) {
        // Fire and forget - let the Intel Agent do its job in the background!
        fetch('/api/intel/analyze-dependencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dependencies: data.dependencies })
        }).catch(err => console.error('Intel Agent Handoff Failed:', err));
      }
    } catch (error: any) {
      console.error(error);
      setScanError(error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-destructive border-destructive bg-destructive/10';
      case 'HIGH': return 'text-warning border-warning bg-warning/10';
      case 'MEDIUM': return 'text-info border-info bg-info/10';
      case 'LOW': return 'text-success border-success bg-success/10';
      default: return 'text-muted-foreground border-border bg-muted/10';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Repository Security</h1>
        <p className="text-muted-foreground">
          Autonomous DevSecOps scanning and AST vulnerability analysis via Gemini 1.5 Pro
        </p>
      </div>

      {!scanResult && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-dashed border-border rounded-lg p-12"
        >
          <div className="text-center max-w-xl mx-auto">
            <Github className="size-16 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">Connect Repository</h3>
            <p className="text-muted-foreground mb-6">
              Enter a public GitHub repository URL to initiate a live semantic security scan.
            </p>
            
            <div className="flex gap-3 max-w-md mx-auto mb-4">
              <input 
                type="text" 
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-input-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleScan}
                disabled={!repoUrl}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Scan
              </button>
            </div>
            
            {scanError && (
              <p className="text-destructive text-sm mt-2">{scanError}</p>
            )}
          </div>
        </motion.div>
      )}

      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px]"
        >
          <Loader2 className="size-12 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-semibold mb-2">Analyzing Repository Architecture</h3>
          <p className="text-muted-foreground animate-pulse">
            Gemini is evaluating abstract syntax trees and dependency graphs...
          </p>
        </motion.div>
      )}

      {scanResult && !isScanning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Files Parsed</p>
                  <p className="text-3xl font-bold">{scanResult.files}</p>
                </div>
                <FileCode className="size-8 text-primary" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-lg border border-destructive/20 bg-destructive/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical Issues</p>
                  <p className="text-3xl font-bold text-destructive">
                    {scanResult.vulnerabilities?.filter(v => v.severity === 'CRITICAL').length || 0}
                  </p>
                </div>
                <XCircle className="size-8 text-destructive" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-lg border border-warning/20 bg-warning/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">High Issues</p>
                  <p className="text-3xl font-bold text-warning">
                    {scanResult.vulnerabilities?.filter(v => v.severity === 'HIGH').length || 0}
                  </p>
                </div>
                <AlertTriangle className="size-8 text-warning" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-lg border border-success/20 bg-success/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dependencies</p>
                  <p className="text-3xl font-bold text-success">{scanResult.dependencies?.length || 0}</p>
                </div>
                <CheckCircle className="size-8 text-success" />
              </div>
            </motion.div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-6">Vulnerabilities Found</h3>
            {(!scanResult.vulnerabilities || scanResult.vulnerabilities.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <CheckCircle className="size-12 text-success mb-2" />
                <p>No vulnerabilities detected in parsed files.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scanResult.vulnerabilities.map((vuln, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-accent/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                          <h4 className="font-semibold">{vuln.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-mono">
                          {vuln.file} {vuln.line ? `(Line ${vuln.line})` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <p className="text-xs text-primary font-semibold mb-1 flex items-center gap-1">
                        <Zap className="size-3" /> AI Recommendation
                      </p>
                      <p className="text-sm">{vuln.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Dependency Analysis</h3>
            {(!scanResult.dependencies || scanResult.dependencies.length === 0) ? (
               <p className="text-sm text-muted-foreground">No dependencies parsed.</p>
            ) : (
              <div className="space-y-3">
                {scanResult.dependencies.map((dep, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm">{dep.name}</div>
                      <div className="text-xs text-muted-foreground">v{dep.version}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dep.vulnerabilities > 0 && (
                        <span className="text-sm">
                          {dep.vulnerabilities} {dep.vulnerabilities === 1 ? 'vulnerability' : 'vulnerabilities'}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(dep.severity)}`}>
                        {dep.severity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setScanResult(null);
                setRepoUrl('');
              }}
              className="px-6 py-3 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-colors"
            >
              Scan New Repository
            </button>
          </div>
        </>
      )}
    </div>
  );
}
