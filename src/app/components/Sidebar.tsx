//src/app/components/Sidebar.tsx
import { NavLink } from 'react-router';
import {
  Shield,
  Activity,
  AlertTriangle,
  GitBranch,
  Server,
  Network,
  Rocket,
  Settings,
  Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Activity, label: 'Dashboard' },
  { to: '/ai-gateway', icon: Shield, label: 'AI Gateway' },
  { to: '/threat-intel', icon: AlertTriangle, label: 'Threat Intel' },
  { to: '/repository', icon: GitBranch, label: 'Repository' },
  { to: '/runtime', icon: Server, label: 'Runtime' },
  { to: '/operations', icon: Network, label: 'Operations' },
  { to: '/deployment', icon: Rocket, label: 'Deployment' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="size-8 text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/30" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">CyberMesh</h1>
            <p className="text-xs text-muted-foreground">Security Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`
                }
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 bg-accent/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">System Status</div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs">All Agents Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
