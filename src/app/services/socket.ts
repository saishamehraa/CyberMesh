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
