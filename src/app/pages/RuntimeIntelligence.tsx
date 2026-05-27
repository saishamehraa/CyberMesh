import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Activity, AlertCircle, Cpu, HardDrive, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from '../services/socket';

const initialServices = [
  { name: 'api-gateway', status: 'healthy', latency: 45, cpu: 23, memory: 512 },
  { name: 'auth-service', status: 'healthy', latency: 32, cpu: 18, memory: 412 },
  { name: 'database', status: 'healthy', latency: 12, cpu: 34, memory: 1024 },
  { name: 'cache-redis', status: 'healthy', latency: 3, cpu: 12, memory: 256 },
  { name: 'worker-queue', status: 'healthy', latency: 89, cpu: 45, memory: 678 },
];

const mockAnomalies = [
  {
    id: '1',
    service: 'api-gateway',
    type: 'Memory Growth',
    severity: 'info',
    description: 'Memory usage trending upward - potential memory leak',
    timestamp: new Date(Date.now() - 420000),
  },
];

export function RuntimeIntelligence() {
  const [services, setServices] = useState(initialServices);
  const [anomalies, setAnomalies] = useState<any[]>(mockAnomalies);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [latencyData, setLatencyData] = useState([
    { time: '5m ago', value: 45 }, { time: '4m ago', value: 52 },
    { time: '3m ago', value: 48 }, { time: '2m ago', value: 42 },
    { time: '1m ago', value: 47 }, { time: 'now', value: 44 },
  ]);

  const [cpuData, setCpuData] = useState([
    { time: '5m ago', api: 23, auth: 18, db: 34 }, { time: '4m ago', api: 28, auth: 22, db: 31 },
    { time: '3m ago', api: 25, auth: 19, db: 36 }, { time: '2m ago', api: 30, auth: 21, db: 33 },
    { time: '1m ago', api: 27, auth: 17, db: 38 }, { time: 'now', api: 24, auth: 20, db: 35 },
  ]);

  useEffect(() => {
    // Normal ambient background noise for charts
    const interval = setInterval(() => {
      setLatencyData(prev => [
        ...prev.slice(1),
        { time: 'now', value: Math.max(30, Math.min(80, prev[prev.length - 1].value + (Math.random() - 0.5) * 10)) },
      ]);
      setCpuData(prev => [
        ...prev.slice(1),
        {
          time: 'now',
          api: Math.max(15, Math.min(40, prev[prev.length - 1].api + (Math.random() - 0.5) * 5)),
          auth: Math.max(10, Math.min(35, prev[prev.length - 1].auth + (Math.random() - 0.5) * 5)),
          db: Math.max(20, Math.min(50, prev[prev.length - 1].db + (Math.random() - 0.5) * 5)),
        },
      ]);
    }, 3000);

    // Live WebHook listener for the Hackathon Demo
    const handleAnomaly = (anomaly: any) => {
      // 1. Add to anomaly feed
      setAnomalies(prev => [{...anomaly, timestamp: new Date(anomaly.timestamp)}, ...prev].slice(0, 10));
      
      // 2. Spike the charts dramatically
      setLatencyData(prev => [...prev.slice(1), { time: 'now', value: anomaly.metrics.latency }]);
      setCpuData(prev => [...prev.slice(1), { time: 'now', api: 25, auth: anomaly.metrics.cpu, db: 38 }]);

      // 3. Update service health indicator
      setServices(prev => prev.map(s => 
        s.name === anomaly.service 
          ? { ...s, status: 'warning', latency: anomaly.metrics.latency, cpu: anomaly.metrics.cpu }
          : s
      ));
    };

    socket.on('runtime_anomaly', handleAnomaly);

    return () => {
      clearInterval(interval);
      socket.off('runtime_anomaly', handleAnomaly);
    };
  }, []);

  const triggerAnomaly = async () => {
    setIsSimulating(true);
    try {
      await fetch('http://localhost:3001/api/runtime/simulate-anomaly', { method: 'POST' });
    } catch (error) {
      console.error('Failed to trigger anomaly:', error);
    } finally {
      setTimeout(() => setIsSimulating(false), 1000);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Runtime Intelligence</h1>
          <p className="text-muted-foreground">
            Production telemetry and observability powered by Dynatrace
          </p>
        </div>
        
        {/* Hackathon Demo Button */}
        <button
          onClick={triggerAnomaly}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          <Zap className={`size-4 ${isSimulating ? 'animate-pulse' : ''}`} />
          Inject Infrastructure Anomaly
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
              <p className="text-sm text-muted-foreground mb-1">Services</p>
              <p className="text-3xl font-bold text-success">5/5</p>
            </div>
            <Server className="size-8 text-success" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">All operational</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg border border-warning/20 bg-warning/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Latency</p>
              <p className="text-3xl font-bold text-warning">{latencyData[latencyData.length - 1].value}ms</p>
            </div>
            <Activity className="size-8 text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Live metric</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg border border-info/20 bg-info/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">CPU Usage</p>
              <p className="text-3xl font-bold text-info">
                {Math.round((cpuData[cpuData.length - 1].api + cpuData[cpuData.length - 1].auth + cpuData[cpuData.length - 1].db) / 3)}%
              </p>
            </div>
            <Cpu className="size-8 text-info" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Cluster average</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-lg border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Memory</p>
              <p className="text-3xl font-bold text-primary">3.2GB</p>
            </div>
            <HardDrive className="size-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">68% of total</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Latency Monitoring</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(245, 158, 11)"
                strokeWidth={2}
                fill="url(#latencyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">CPU Utilization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cpuData}>
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
              <Line type="monotone" dataKey="api" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="auth" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="db" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Service Health</h3>
        <div className="space-y-3">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className={`size-3 rounded-full ${service.status === 'healthy' ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                <div>
                  <h4 className="font-semibold font-mono text-sm">{service.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Latency: {service.latency}ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">CPU: </span>
                  <span className="font-medium">{service.cpu}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Memory: </span>
                  <span className="font-medium">{service.memory}MB</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Detected Anomalies</h3>
        <div className="space-y-3">
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                anomaly.severity === 'warning'
                  ? 'bg-warning/5 border-warning/20'
                  : 'bg-info/5 border-info/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`size-5 flex-shrink-0 ${anomaly.severity === 'warning' ? 'text-warning' : 'text-info'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{anomaly.type}</h4>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-mono">{anomaly.service}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {anomaly.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
