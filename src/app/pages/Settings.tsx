//src/app/pages/Settings.tsx
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Shield, Zap, Database, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure CyberMesh security operations platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="size-6 text-primary" />
            <h3 className="font-semibold">AI Gateway Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Sensitivity Level</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option>High (Recommended)</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Block Prompt Injections</div>
                <div className="text-xs text-muted-foreground">Automatically block detected attacks</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Enable Jailbreak Detection</div>
                <div className="text-xs text-muted-foreground">Detect privilege escalation attempts</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="size-6 text-purple" />
            <h3 className="font-semibold">Threat Intelligence</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">NVD Database</div>
                <div className="text-xs text-muted-foreground">National Vulnerability Database</div>
              </div>
              <div className="size-2 rounded-full bg-success animate-pulse" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">GitHub Advisories</div>
                <div className="text-xs text-muted-foreground">Open source security advisories</div>
              </div>
              <div className="size-2 rounded-full bg-success animate-pulse" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">OSV.dev</div>
                <div className="text-xs text-muted-foreground">Open Source Vulnerabilities</div>
              </div>
              <div className="size-2 rounded-full bg-success animate-pulse" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Update Frequency</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option>Real-time</option>
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Hourly</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="size-6 text-cyan" />
            <h3 className="font-semibold">Runtime Intelligence</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Dynatrace Environment</label>
              <input
                type="text"
                placeholder="your-environment.live.dynatrace.com"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">API Token</label>
              <input
                type="password"
                placeholder="dt0c01...."
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Anomaly Detection</div>
                <div className="text-xs text-muted-foreground">AI-powered anomaly detection</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="size-6 text-warning" />
            <h3 className="font-semibold">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Critical Vulnerabilities</div>
                <div className="text-xs text-muted-foreground">Immediate alerts for critical issues</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Deployment Failures</div>
                <div className="text-xs text-muted-foreground">Alert on blocked deployments</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Runtime Anomalies</div>
                <div className="text-xs text-muted-foreground">Production incident notifications</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Notification Channel</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option>Email</option>
                <option>Slack</option>
                <option>Microsoft Teams</option>
                <option>Webhook</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="size-6 text-success" />
            <h3 className="font-semibold">AI Models</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Primary Model</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option>Gemini 2.0 Flash</option>
                <option>Gemini 2.5 Pro</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Fallback Model</label>
              <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg">
                <option>Ollama (Local)</option>
                <option>GPT-4 Turbo</option>
                <option>Claude 3 Haiku</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Enable Caching</div>
                <div className="text-xs text-muted-foreground">Cache responses for performance</div>
              </div>
              <input type="checkbox" defaultChecked className="size-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="size-6 text-info" />
            <h3 className="font-semibold">System</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Version</div>
              <div className="font-semibold">CyberMesh v1.0.0</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Deployment</div>
              <div className="font-semibold">Google Cloud Platform</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Region</div>
              <div className="font-semibold">us-central1</div>
            </div>

            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
