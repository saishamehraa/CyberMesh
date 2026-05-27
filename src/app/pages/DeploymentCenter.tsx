// src/app/pages/DeploymentCenter.tsx
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket, CheckCircle, XCircle, AlertTriangle, Clock, GitBranch, Shield, Play } from 'lucide-react';
import { socket } from '../services/socket';

type DeploymentStatus = 'PASS' | 'WARN' | 'BLOCKED' | 'PENDING';

interface DeploymentCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'pending';
  message: string;
  agent: string;
}

interface Deployment {
  id: string;
  name: string;
  branch: string;
  status: DeploymentStatus;
  score: number;
  timestamp: Date;
  checks: DeploymentCheck[];
}

export function DeploymentCenter() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    // 1. Fetch initial deployments
    const fetchDeployments = async () => {
      try {
        const res = await fetch('/api/deployment');
        const data = await res.json();
        const parsed = data.map((d: any) => ({ ...d, timestamp: new Date(d.timestamp) }));
        setDeployments(parsed);
      } catch (error) {
        console.error('Failed to fetch deployments:', error);
      }
    };
    fetchDeployments();

    // 2. Listen for new manual deployments
    const handleNewDeployment = (dep: any) => {
      setDeployments(prev => [{ ...dep, timestamp: new Date(dep.timestamp) }, ...prev]);
    };

    // 3. THE MAGIC: Listen to the Nexus Orchestrator!
    const handleOrchestrationAction = (action: any) => {
      if (action.message.includes('deployment block') || action.message.includes('CRITICAL')) {
        setDeployments(prev => prev.map(dep => {
          if (dep.status === 'PENDING') {
            const blockedDep: Deployment = {
              ...dep,
              status: 'BLOCKED',
              score: 24, // Drop the score
              checks: dep.checks.map((check: any) => ({
                ...check,
                status: check.agent === 'Runtime' || check.agent === 'Intel' ? 'fail' : 'pass',
                message: check.agent === 'Runtime' ? 'Critical infrastructure anomaly detected' :
                  check.agent === 'Intel' ? 'Correlated CVE exploit active' : 'Check passed'
              }))
            };

            // If the user is currently looking at this deployment, update their view
            setSelectedDeployment((currentSelected: any) =>
              currentSelected?.id === blockedDep.id ? blockedDep : currentSelected
            );

            return blockedDep;
          }
          return dep;
        }));
      }
    };

    socket.on('deployment_new', handleNewDeployment);
    socket.on('orchestration_action', handleOrchestrationAction);

    return () => {
      socket.off('deployment_new', handleNewDeployment);
      socket.off('orchestration_action', handleOrchestrationAction);
    };
  }, []);

  const triggerDeployment = async () => {
    setIsDeploying(true);
    try {
      await fetch('/api/deployment/trigger', { method: 'POST' });
    } catch (error) {
      console.error('Failed to trigger deployment:', error);
    } finally {
      setTimeout(() => setIsDeploying(false), 1000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-success border-success bg-success/10';
      case 'WARN': return 'text-warning border-warning bg-warning/10';
      case 'BLOCKED': return 'text-destructive border-destructive bg-destructive/10';
      case 'PENDING': return 'text-primary border-primary bg-primary/10';
      default: return 'text-muted border-muted bg-muted/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return CheckCircle;
      case 'WARN': return AlertTriangle;
      case 'BLOCKED': return XCircle;
      case 'PENDING': return Clock;
      default: return Clock;
    }
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="size-5 text-success" />;
      case 'warn': return <AlertTriangle className="size-5 text-warning" />;
      case 'fail': return <XCircle className="size-5 text-destructive" />;
      case 'pending': return <Clock className="size-5 text-primary animate-pulse" />;
      default: return <Clock className="size-5 text-muted" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deployment Center</h1>
          <p className="text-muted-foreground">
            Intelligent deployment pipeline with automated security verification
          </p>
        </div>

        {/* Hackathon Demo Trigger */}
        <button
          onClick={triggerDeployment}
          disabled={isDeploying}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          <Play className={`size-4 ${isDeploying ? 'animate-pulse' : ''}`} />
          Initiate Production Release
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-success/20 bg-success/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Passed</p>
              <p className="text-3xl font-bold text-success">
                {deployments.filter(d => d.status === 'PASS').length}
              </p>
            </div>
            <CheckCircle className="size-8 text-success" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg border border-warning/20 bg-warning/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Warning</p>
              <p className="text-3xl font-bold text-warning">
                {deployments.filter(d => d.status === 'WARN').length}
              </p>
            </div>
            <AlertTriangle className="size-8 text-warning" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg border border-destructive/20 bg-destructive/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Blocked</p>
              <p className="text-3xl font-bold text-destructive">
                {deployments.filter(d => d.status === 'BLOCKED').length}
              </p>
            </div>
            <XCircle className="size-8 text-destructive" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-primary">
                {deployments.filter(d => d.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="size-8 text-primary" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Recent Deployments</h3>
          <div className="space-y-3">
            {deployments.map((deployment, index) => {
              const StatusIcon = getStatusIcon(deployment.status);
              return (
                <motion.div
                  key={deployment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDeployment(deployment)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${deployment.status === 'PENDING'
                      ? 'bg-primary/5 border-primary/30 animate-pulse'
                      : 'bg-accent/30 border-border hover:border-primary/50'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="size-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-semibold">{deployment.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${getStatusColor(deployment.status)}`}>
                      <StatusIcon className={`size-3 ${deployment.status === 'PENDING' ? 'animate-spin' : ''}`} />
                      {deployment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{deployment.timestamp.toLocaleString()}</span>
                    <span>Score: {deployment.score}/100</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {selectedDeployment ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h3 className="font-semibold mb-4">Deployment Details</h3>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-mono text-sm font-semibold mb-1">{selectedDeployment.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedDeployment.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">{selectedDeployment.score}/100</div>
                  <div className="text-xs text-muted-foreground">Security Score</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${getStatusColor(selectedDeployment.status)} flex items-center justify-center gap-2`}>
                {(() => {
                  const Icon = getStatusIcon(selectedDeployment.status);
                  return <Icon className="size-6" />;
                })()}
                <span className="text-lg font-bold">{selectedDeployment.status}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Security Checks</h4>
              {selectedDeployment.checks.map((check, index) => (
                <div
                  key={index}
                  className="p-3 bg-accent/30 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3">
                    {getCheckIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-semibold text-sm">{check.name}</h5>
                        <span className="text-xs text-muted-foreground">{check.agent}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDeployment.status === 'BLOCKED' && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-destructive">Deployment Blocked</h4>
                <p className="text-xs text-muted-foreground">
                  This deployment has been automatically blocked due to critical security issues.
                  Address the failed checks before redeploying.
                </p>
              </div>
            )}

            {selectedDeployment.status === 'WARN' && (
              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-warning">Proceed with Caution</h4>
                <p className="text-xs text-muted-foreground">
                  This deployment has warnings. Review the issues before proceeding.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <Rocket className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a deployment to view details
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Deployment Pipeline</h3>
        <div className="flex items-center justify-between">
          {[
            { name: 'Gateway Check', icon: Shield, color: 'text-primary' },
            { name: 'Threat Analysis', icon: AlertTriangle, color: 'text-purple' },
            { name: 'Code Scan', icon: GitBranch, color: 'text-cyan' },
            { name: 'Runtime Test', icon: Rocket, color: 'text-success' },
          ].map((stage, index) => (
            <div key={stage.name} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`p-3 rounded-full border-2 border-current ${stage.color} bg-card`}>
                  <stage.icon className="size-6" />
                </div>
                <span className="text-xs mt-2 text-center">{stage.name}</span>
              </div>
              {index < 3 && (
                <div className="h-0.5 bg-border flex-1 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
