// services/nexus-orchestrator/src/index.ts
import { io } from 'socket.io-client';
import dotenv from 'dotenv';
// import { Queue, Worker } from 'bullmq';

dotenv.config();

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3001';

console.log(`Starting Nexus Orchestrator... Connecting to ${GATEWAY_URL}`);

const socket = io(GATEWAY_URL);

let securityScore = 92;

socket.on('connect', () => {
  console.log('Connected to Gateway Socket:', socket.id);
  socket.emit('subscribe', 'orchestration');
});

socket.on('agent_event', (event: any) => {
  console.log('Received agent event:', event);

  // Basic simulation of multi-agent reasoning:
  // If we receive an error from any agent, we decrease the score.
  if (event.type === 'error') {
    securityScore = Math.max(0, securityScore - 20);
  } else if (event.type === 'warning') {
    securityScore = Math.max(0, securityScore - 10);
  } else if (event.type === 'success') {
    securityScore = Math.min(100, securityScore + 5);
  }

  console.log(`Current Composite Security Score: ${securityScore}`);

  if (securityScore < 50) {
    const deploymentBlockEvent = {
      id: Date.now().toString(),
      type: 'error',
      agent: 'Nexus Orchestrator',
      message: 'Composite risk elevated to CRITICAL. Automating deployment block.',
      timestamp: new Date()
    };

    setTimeout(() => {
      console.log('Emitting automated orchestration response...');
      socket.emit('orchestration_action', deploymentBlockEvent);
    }, 1500);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from Gateway');
});
