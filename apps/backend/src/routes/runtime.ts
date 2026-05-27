// apps/backend/src/routes/runtime.ts
import { Router, Request, Response } from 'express';
// import { prisma } from '../db'; // We will set this up in Part 2

const router = Router();

// Secure this in production with a secret token header!
router.post('/dynatrace-webhook', async (req: Request, res: Response) => {
  const io = (req as any).io;
  
  // Dynatrace sends a specific JSON payload (defined in step 2 below)
  const { State, ProblemID, ProblemTitle, ImpactedEntity, Severity } = req.body;

  // We only care about OPEN problems for immediate orchestration blocks
  if (State !== 'OPEN') {
    return res.status(200).json({ message: 'Ignored non-open state.' });
  }

  console.log(`[Dynatrace Alert] Received ${Severity} anomaly on ${ImpactedEntity}: ${ProblemTitle}`);

  const anomaly = {
    id: ProblemID,
    service: ImpactedEntity,
    type: ProblemTitle,
    severity: Severity?.toLowerCase() === 'error' ? 'critical' : 'warning',
    description: `Dynatrace detected a live infrastructure anomaly on ${ImpactedEntity}.`,
    timestamp: new Date(),
    metrics: {
      latency: Math.floor(Math.random() * (800 - 400) + 400),
      cpu: Math.floor(Math.random() * (99 - 85) + 85)
    }
  };

  // 1. Alert the Frontend UI Charts
  io.emit('runtime_anomaly', anomaly);

  // 2. Alert the Nexus Orchestrator to potentially block deployments
  io.to('orchestration').emit('agent_event', {
    id: ProblemID,
    type: anomaly.severity === 'critical' ? 'error' : 'warning',
    agent: 'Runtime Agent',
    message: `[DYNATRACE LIVE] ${ProblemTitle} on ${ImpactedEntity}`,
    timestamp: new Date()
  });

  // Optional: Save this event to PostgreSQL using Prisma
  // await prisma.agentEvent.create({ data: { agent: 'Runtime Agent', type: 'error', message: ProblemTitle }});

  return res.status(200).json({ success: true });
});

// Endpoint for your hackathon demo!
router.post('/simulate-anomaly', (req: Request, res: Response) => {
  const io = (req as any).io;
  
  const anomaly = {
    id: Date.now().toString(),
    service: 'auth-service',
    type: 'Critical Latency Spike',
    severity: 'warning',
    description: 'Response time increased by 450% in the last 15 seconds. High CPU threshold breached.',
    timestamp: new Date(),
    metrics: {
      latency: Math.floor(Math.random() * (800 - 400) + 400), // Spike to 400-800ms
      cpu: Math.floor(Math.random() * (99 - 85) + 85) // Spike to 85-99%
    }
  };

  // 1. Send specific telemetry spike to the Runtime Intelligence page
  io.emit('runtime_anomaly', anomaly);

  // 2. Alert the Orchestrator (This makes the Runtime node glow!)
  io.to('orchestration').emit('agent_event', {
    id: Date.now().toString(),
    type: 'error',
    agent: 'Runtime Agent',
    message: `Operational anomaly detected in auth-service. Latency: ${anomaly.metrics.latency}ms. Possible active exploit.`,
    timestamp: new Date()
  });

  res.json({ success: true, anomaly });
});

export default router;
