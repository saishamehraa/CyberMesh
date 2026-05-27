//src/app/pages/AutonomousOperations.tsx
import { useCallback, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Zap, Shield, GitBranch, Server, Network, Activity as ActivityIcon } from 'lucide-react';
import { socket } from '../services/socket';

const initialNodes: Node[] = [
  {
    id: 'gateway',
    type: 'default',
    data: {
      label: (
        <div className="flex items-center gap-2">
          <Shield className="size-4" />
          <span>Gateway Agent</span>
        </div>
      ),
    },
    position: { x: 250, y: 50 },
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '2px solid rgb(59, 130, 246)',
      borderRadius: '8px',
      padding: '12px',
      color: '#e4e7f0',
    },
  },
  {
    id: 'intel',
    type: 'default',
    data: {
      label: (
        <div className="flex items-center gap-2">
          <ActivityIcon className="size-4" />
          <span>Intel Agent</span>
        </div>
      ),
    },
    position: { x: 100, y: 150 },
    style: {
      background: 'rgba(139, 92, 246, 0.1)',
      border: '2px solid rgb(139, 92, 246)',
      borderRadius: '8px',
      padding: '12px',
      color: '#e4e7f0',
    },
  },
  {
    id: 'devsecops',
    type: 'default',
    data: {
      label: (
        <div className="flex items-center gap-2">
          <GitBranch className="size-4" />
          <span>DevSecOps Agent</span>
        </div>
      ),
    },
    position: { x: 400, y: 150 },
    style: {
      background: 'rgba(6, 182, 212, 0.1)',
      border: '2px solid rgb(6, 182, 212)',
      borderRadius: '8px',
      padding: '12px',
      color: '#e4e7f0',
    },
  },
  {
    id: 'runtime',
    type: 'default',
    data: {
      label: (
        <div className="flex items-center gap-2">
          <Server className="size-4" />
          <span>Runtime Agent</span>
        </div>
      ),
    },
    position: { x: 550, y: 250 },
    style: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '2px solid rgb(16, 185, 129)',
      borderRadius: '8px',
      padding: '12px',
      color: '#e4e7f0',
    },
  },
  {
    id: 'nexus',
    type: 'default',
    data: {
      label: (
        <div className="flex items-center gap-2">
          <Network className="size-4" />
          <span>Nexus Orchestrator</span>
        </div>
      ),
    },
    position: { x: 250, y: 300 },
    style: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: '2px solid rgb(245, 158, 11)',
      borderRadius: '8px',
      padding: '12px',
      color: '#e4e7f0',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'gateway-nexus',
    source: 'gateway',
    target: 'nexus',
    animated: true,
    style: { stroke: 'rgb(59, 130, 246)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(59, 130, 246)' },
  },
  {
    id: 'intel-nexus',
    source: 'intel',
    target: 'nexus',
    animated: true,
    style: { stroke: 'rgb(139, 92, 246)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(139, 92, 246)' },
  },
  {
    id: 'devsecops-nexus',
    source: 'devsecops',
    target: 'nexus',
    animated: true,
    style: { stroke: 'rgb(6, 182, 212)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(6, 182, 212)' },
  },
  {
    id: 'runtime-nexus',
    source: 'runtime',
    target: 'nexus',
    animated: true,
    style: { stroke: 'rgb(16, 185, 129)', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(16, 185, 129)' },
  },
];

const mockEvents = [
  {
    id: '1',
    type: 'warning' as const,
    agent: 'Gateway Agent',
    message: 'Prompt injection detected in user input',
    timestamp: new Date(Date.now() - 5000),
  },
  {
    id: '2',
    type: 'info' as const,
    agent: 'Intel Agent',
    message: 'CVE-2024-1234 correlated with project dependencies',
    timestamp: new Date(Date.now() - 8000),
  },
  {
    id: '3',
    type: 'error' as const,
    agent: 'DevSecOps Agent',
    message: 'Critical vulnerability in authentication module',
    timestamp: new Date(Date.now() - 12000),
  },
  {
    id: '4',
    type: 'warning' as const,
    agent: 'Runtime Agent',
    message: 'Latency spike in auth-service detected',
    timestamp: new Date(Date.now() - 15000),
  },
];

export function AutonomousOperations() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [events, setEvents] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('cybermesh_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }));
      } catch (e) { return mockEvents; }
    }
    return mockEvents;
  });

  useEffect(() => {
    sessionStorage.setItem('cybermesh_events', JSON.stringify(events));
  }, [events]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    const handleAgentEvent = (event: any) => {
      setEvents((prev) => {
        const isMock = prev === mockEvents;
        const parsedEvent = {
          ...event,
          timestamp: new Date(event.timestamp || Date.now())
        };
        return isMock ? [parsedEvent] : [parsedEvent, ...prev].slice(0, 10);
      });

      // Bonus: animate nodes based on event agent
      const agentNodeMap: Record<string, string> = {
        'Gateway Agent': 'gateway',
        'Intel Agent': 'intel',
        'DevSecOps Agent': 'devsecops',
        'Runtime Agent': 'runtime',
        'Nexus Orchestrator': 'nexus'
      };

      const nodeId = agentNodeMap[event.agent];
      if (nodeId) {
        setNodes(nds => nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              style: {
                ...node.style,
                boxShadow: '0 0 15px 5px currentColor',
                transition: 'all 0.3s ease'
              }
            };
          }
          return node;
        }));

        setTimeout(() => {
          setNodes(nds => nds.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                style: {
                  ...node.style,
                  boxShadow: 'none'
                }
              };
            }
            return node;
          }));
        }, 1000);
      }
    };

    socket.on('agent_event', handleAgentEvent);
    socket.on('orchestration_action', handleAgentEvent);

    return () => {
      socket.off('agent_event', handleAgentEvent);
      socket.off('orchestration_action', handleAgentEvent);
    };
  }, [setNodes]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Autonomous Operations</h1>
        <p className="text-muted-foreground">
          Multi-agent orchestration and coordination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Agent Orchestration Map</h3>
          </div>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              style={{
                background: '#0a0e1a',
              }}
            >
              <Background color="#1e293b" gap={16} />
              <Controls />
              <MiniMap
                style={{
                  background: '#0f1629',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
                nodeColor={(node) => {
                  if (node.id === 'gateway') return 'rgb(59, 130, 246)';
                  if (node.id === 'intel') return 'rgb(139, 92, 246)';
                  if (node.id === 'devsecops') return 'rgb(6, 182, 212)';
                  if (node.id === 'runtime') return 'rgb(16, 185, 129)';
                  if (node.id === 'nexus') return 'rgb(245, 158, 11)';
                  return '#666';
                }}
              />
            </ReactFlow>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Orchestration Events</h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {events.map((event, index) => {
              const icons = {
                success: '✓',
                warning: '⚠',
                error: '✕',
                info: 'ℹ',
              };
              const colors = {
                success: 'text-success bg-success/10 border-success/20',
                warning: 'text-warning bg-warning/10 border-warning/20',
                error: 'text-destructive bg-destructive/10 border-destructive/20',
                info: 'text-info bg-info/10 border-info/20',
              };

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${colors[event.type as keyof typeof colors]}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{icons[event.type as keyof typeof icons]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium mb-1">{event.agent}</div>
                      <div className="text-sm">{event.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="size-6 text-primary" />
            <h3 className="font-semibold">Active Agents</h3>
          </div>
          <p className="text-3xl font-bold mb-1">5/5</p>
          <p className="text-xs text-muted-foreground">All agents operational</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg border border-success/20 bg-success/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Network className="size-6 text-success" />
            <h3 className="font-semibold">Events Processed</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{events.length}</p>
          <p className="text-xs text-muted-foreground">Real-time orchestrated events</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg border border-warning/20 bg-warning/5"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="size-6 text-warning" />
            <h3 className="font-semibold">Decisions Made</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{events.filter(e => e.type === 'error' || e.type === 'success').length}</p>
          <p className="text-xs text-muted-foreground">Autonomous mesh actions</p>
        </motion.div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Agent Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-accent/30 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="size-5 text-primary" />
              <h4 className="font-semibold text-sm">Gateway Agent</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Prompt injection detection, jailbreak prevention, AI firewall
            </p>
          </div>

          <div className="p-4 bg-accent/30 rounded-lg border border-purple/20">
            <div className="flex items-center gap-2 mb-2">
              <ActivityIcon className="size-5 text-purple" />
              <h4 className="font-semibold text-sm">Intel Agent</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              CVE aggregation, exploit monitoring, threat intelligence
            </p>
          </div>

          <div className="p-4 bg-accent/30 rounded-lg border border-cyan/20">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="size-5 text-cyan" />
              <h4 className="font-semibold text-sm">DevSecOps Agent</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Repository scanning, dependency auditing, vulnerability detection
            </p>
          </div>

          <div className="p-4 bg-accent/30 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Server className="size-5 text-success" />
              <h4 className="font-semibold text-sm">Runtime Agent</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Production telemetry, anomaly detection, operational intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
