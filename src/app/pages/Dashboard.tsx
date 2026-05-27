//src/app/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SecurityScore } from '../components/SecurityScore';
import { MetricCard } from '../components/MetricCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { ThreatCard } from '../components/ThreatCard';
import { Shield, AlertTriangle, CheckCircle, Zap, Server, GitBranch } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Activity = {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  agent: string;
  message: string;
  timestamp: Date;
};

type Threat = {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  affectedPackage?: string;
  publishedDate: Date;
  cvss?: number;
};

const mockThreats: Threat[] = [
  {
    id: '1',
    cve: 'CVE-2024-1234',
    severity: 'CRITICAL',
    title: 'Remote Code Execution in Express.js',
    affectedPackage: 'express@4.17.1',
    publishedDate: new Date('2024-05-20'),
    cvss: 9.8,
  },
  {
    id: '2',
    cve: 'CVE-2024-5678',
    severity: 'HIGH',
    title: 'SQL Injection vulnerability in Sequelize ORM',
    affectedPackage: 'sequelize@6.21.0',
    publishedDate: new Date('2024-05-22'),
    cvss: 8.1,
  },
  {
    id: '3',
    cve: 'CVE-2024-9012',
    severity: 'MEDIUM',
    title: 'Cross-Site Scripting in React DOM',
    affectedPackage: 'react-dom@18.2.0',
    publishedDate: new Date('2024-05-23'),
    cvss: 6.5,
  },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'warning',
    agent: 'Gateway Agent',
    message: 'Prompt injection attempt detected and blocked',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    type: 'error',
    agent: 'DevSecOps Agent',
    message: 'Critical vulnerability found in authentication module',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '3',
    type: 'info',
    agent: 'Runtime Agent',
    message: 'Latency spike detected in production auth service',
    timestamp: new Date(Date.now() - 450000),
  },
  {
    id: '4',
    type: 'success',
    agent: 'Nexus Orchestrator',
    message: 'Deployment automatically blocked due to composite risk',
    timestamp: new Date(Date.now() - 600000),
  },
];

const securityTrendData = [
  { time: '00:00', score: 85 },
  { time: '04:00', score: 87 },
  { time: '08:00', score: 82 },
  { time: '12:00', score: 78 },
  { time: '16:00', score: 92 },
  { time: '20:00', score: 92 },
];

const threatVolumeData = [
  { time: '00:00', threats: 12 },
  { time: '04:00', threats: 8 },
  { time: '08:00', threats: 15 },
  { time: '12:00', threats: 23 },
  { time: '16:00', threats: 19 },
  { time: '20:00', threats: 14 },
];

export function Dashboard() {
  const [securityScore, setSecurityScore] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityScore(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple/20 to-cyan/20 p-8 border border-primary/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]" />
          <div className="relative">
            <h1 className="text-4xl font-bold mb-2">CyberMesh Command Center</h1>
            <p className="text-muted-foreground">
              Autonomous AI Security Operations Platform
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Threats"
          value={23}
          change="+3 today"
          icon={AlertTriangle}
          trend="up"
          color="red"
        />
        <MetricCard
          title="Blocked Attacks"
          value={147}
          change="+12 today"
          icon={Shield}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Deployments"
          value={8}
          change="2 pending"
          icon={GitBranch}
          trend="neutral"
          color="blue"
        />
        <MetricCard
          title="Runtime Health"
          value="99.8%"
          change="+0.2%"
          icon={Server}
          trend="up"
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex items-center justify-center bg-card border border-border rounded-lg p-8">
          <div className="text-center">
            <h3 className="font-semibold mb-4">Security Index</h3>
            <SecurityScore score={securityScore} size="lg" />
            <p className="text-sm text-muted-foreground mt-4">
              Composite security posture across all agents
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Security Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={securityTrendData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1629',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
                fill="url(#scoreGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Threat Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={threatVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1629',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="rgb(239, 68, 68)"
                strokeWidth={2}
                dot={{ fill: 'rgb(239, 68, 68)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ActivityFeed activities={mockActivities} title="Agent Activity Stream" />
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Threats</h3>
          <span className="text-xs text-muted-foreground">Last 24 hours</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockThreats.map((threat) => (
            <ThreatCard key={threat.id} threat={threat} />
          ))}
        </div>
      </div>
    </div>
  );
}
