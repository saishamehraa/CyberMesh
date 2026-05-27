import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ThreatCard } from '../components/ThreatCard';
import { AlertTriangle, TrendingUp, Shield, Globe, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { socket } from '../services/socket';

type Threat = {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  affectedPackage?: string;
  publishedDate: Date;
  cvss?: number;
};

const exploitTrends = [
  { category: 'RCE', count: 15 },
  { category: 'SQLi', count: 23 },
  { category: 'XSS', count: 31 },
  { category: 'Auth', count: 12 },
  { category: 'CSRF', count: 8 },
];

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

export function ThreatIntelligence() {
  const [liveThreats, setLiveThreats] = useState<Threat[]>(mockThreats);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch initial state
  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/intel/threats');
        const data = await res.json();
        if (data && data.length > 0) {
          const parsedData = data.map((t: any) => ({ ...t, publishedDate: new Date(t.publishedDate || t.published_date) }));
          setLiveThreats(parsedData);
        } else {
          setLiveThreats(mockThreats);
        }
      } catch (error) {
        console.error('Failed to fetch threats:', error);
        setLiveThreats(mockThreats);
      }
    };
    fetchThreats();

    // Listen for live socket injections
    const handleNewThreat = (newThreat: any) => {
      setLiveThreats(prev => {
        const isMock = prev === mockThreats;
        const parsedThreat = {
          ...newThreat, 
          publishedDate: new Date(newThreat.publishedDate || newThreat.published_date)
        };
        return isMock ? [parsedThreat] : [parsedThreat, ...prev].slice(0, 12);
      });
    };

    socket.on('new_cve_threat', handleNewThreat);

    return () => {
      socket.off('new_cve_threat', handleNewThreat);
    };
  }, []);

  // Demo trigger for the hackathon
  const triggerSimulatedThreat = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/intel/simulate', { method: 'POST' });
    } catch (error) {
      console.error('Failed to simulate threat:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const filteredThreats = filter === 'ALL'
    ? liveThreats
    : liveThreats.filter(t => t.severity === filter);

  const stats = {
    CRITICAL: liveThreats.filter(t => t.severity === 'CRITICAL').length,
    HIGH: liveThreats.filter(t => t.severity === 'HIGH').length,
    MEDIUM: liveThreats.filter(t => t.severity === 'MEDIUM').length,
    LOW: liveThreats.filter(t => t.severity === 'LOW').length,
  };

  const dynamicSeverityDistribution = [
    { severity: 'CRITICAL', count: stats.CRITICAL, color: '#ef4444' },
    { severity: 'HIGH', count: stats.HIGH, color: '#f59e0b' },
    { severity: 'MEDIUM', count: stats.MEDIUM, color: '#06b6d4' },
    { severity: 'LOW', count: stats.LOW, color: '#10b981' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Threat Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time threat feeds and vulnerability intelligence
          </p>
        </div>
        
        {/* Hackathon Demo Button */}
        <button
          onClick={triggerSimulatedThreat}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-purple/10 text-purple border border-purple/20 rounded-lg hover:bg-purple/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Agent Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-destructive/20 bg-destructive/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Critical</p>
              <p className="text-3xl font-bold text-destructive">{stats.CRITICAL}</p>
            </div>
            <AlertTriangle className="size-8 text-destructive" />
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
              <p className="text-sm text-muted-foreground mb-1">High</p>
              <p className="text-3xl font-bold text-warning">{stats.HIGH}</p>
            </div>
            <TrendingUp className="size-8 text-warning" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg border border-info/20 bg-info/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Medium</p>
              <p className="text-3xl font-bold text-info">{stats.MEDIUM}</p>
            </div>
            <Shield className="size-8 text-info" />
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
              <p className="text-sm text-muted-foreground mb-1">Low</p>
              <p className="text-3xl font-bold text-success">{stats.LOW}</p>
            </div>
            <Globe className="size-8 text-success" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dynamicSeverityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis dataKey="severity" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1629',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {dynamicSeverityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Exploit Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={exploitTrends} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="category" type="category" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f1629',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Live Threat Feed</h3>
          <div className="flex gap-2">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filter === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThreats.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring' }}
            >
              <ThreatCard threat={threat} />
            </motion.div>
          ))}
        </div>

        {filteredThreats.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No threats found for selected filter
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <h4 className="font-semibold text-sm">NVD Database</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              National Vulnerability Database - Real-time CVE feeds
            </p>
          </div>
          <div className="p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <h4 className="font-semibold text-sm">GitHub Advisories</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Security advisories for open source packages
            </p>
          </div>
          <div className="p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <h4 className="font-semibold text-sm">OSV.dev</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Open Source Vulnerabilities database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
