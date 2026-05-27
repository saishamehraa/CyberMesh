// apps/backend/src/routes/gateway.ts
import { Router } from 'express';
import { analyzePrompt } from '../controllers/gateway';

const router = Router();

router.post('/analyze', analyzePrompt);

export default router;
