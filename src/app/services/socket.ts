// src/app/services/socket.ts
/// <reference types="vite/client" />
import { io } from 'socket.io-client';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || (import.meta.env.PROD ? undefined : 'http://localhost:3001');

export const socket = io(GATEWAY_URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('[CyberMesh UI] Connected to Gateway Mesh:', socket.id);
  socket.emit('subscribe', 'orchestration');
});

socket.on('disconnect', () => {
  console.log('[CyberMesh UI] Disconnected from Gateway Mesh');
});

// Global telemetry interceptor: saves live events to sessionStorage even when tabs are unmounted!
const handleGlobalEvent = (event: any) => {
  // 1. Persist for Dashboard
  try {
    const savedDash = sessionStorage.getItem('cybermesh_activities');
    const prevDash = savedDash ? JSON.parse(savedDash) : [];
    // Only update if it's not the initial mock data (id '1', '2', '3') or we don't have this ID yet
    if (!prevDash.some((e: any) => e.id === event.id)) {
      const newDashEvent = {
        id: event.id || Date.now().toString(),
        type: event.type || 'info',
        agent: event.agent || 'System',
        message: event.message,
        timestamp: new Date(event.timestamp || Date.now())
      };
      
      // If the current list is exactly the mock list, overwrite it instead of appending
      const isMock = prevDash.length > 0 && prevDash[0].id === '1' && prevDash[0].agent === 'Gateway Agent';
      const nextDash = isMock ? [newDashEvent] : [newDashEvent, ...prevDash].slice(0, 10);
      
      sessionStorage.setItem('cybermesh_activities', JSON.stringify(nextDash));
      // Dispatch a custom event so mounted components can force re-render if they want
      window.dispatchEvent(new Event('cybermesh_telemetry_update'));
    }
  } catch (e) {}

  // 2. Persist for Autonomous Operations
  try {
    const savedOps = sessionStorage.getItem('cybermesh_events');
    const prevOps = savedOps ? JSON.parse(savedOps) : [];
    if (!prevOps.some((e: any) => e.id === event.id)) {
      const newOpsEvent = {
        ...event,
        timestamp: new Date(event.timestamp || Date.now())
      };
      
      const isMock = prevOps.length > 0 && prevOps[0].id === '1' && prevOps[0].agent === 'Gateway Agent';
      const nextOps = isMock ? [newOpsEvent] : [newOpsEvent, ...prevOps].slice(0, 20);
      
      sessionStorage.setItem('cybermesh_events', JSON.stringify(nextOps));
    }
  } catch (e) {}
};

socket.on('agent_event', handleGlobalEvent);
socket.on('orchestration_action', handleGlobalEvent);
socket.on('new_cve_threat', (threat: any) => {
  window.dispatchEvent(new CustomEvent('cybermesh_new_threat', { detail: threat }));
});
