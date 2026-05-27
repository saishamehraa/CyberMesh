// apps/backend/src/routes/orchestration.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/events', (req: Request, res: Response) => {
  const mockEvents = [
    {
      id: '1',
      type: 'warning',
      agent: 'Gateway Agent',
      message: 'Prompt injection detected in user input',
      timestamp: new Date(Date.now() - 5000),
    }
  ];
  res.json(mockEvents);
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    activeAgents: 5,
    eventsProcessed: 1247,
    decisionsMade: 342
  });
});

export default router;
