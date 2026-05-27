// apps/backend/src/routes/devsecops.ts
import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are the CyberMesh DevSecOps Agent, an elite AI security auditor. 
Analyze the provided repository code snippets and dependencies for security vulnerabilities.
Focus on OWASP Top 10, hardcoded secrets, and vulnerable dependencies.

You MUST respond strictly in valid JSON format matching this schema:
{
  "files": <number of files analyzed>,
  "vulnerabilities": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": "<string>",
      "file": "<string>",
      "line": <number>,
      "recommendation": "<string explaining how to fix it>"
    }
  ],
  "dependencies": [
    {
      "name": "<string>",
      "version": "<string>",
      "vulnerabilities": <number>,
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE"
    }
  ]
}
Respond ONLY with raw JSON. Do not use markdown blocks like \`\`\`json.`;

// Helper function to fetch files from GitHub API
async function fetchGithubRepoData(repoUrl: string) {
  // Extract owner and repo from URL (e.g., https://github.com/expressjs/express)
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  
  const [, owner, repo] = match;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
  
  let repoContext = '';
  let fileCount = 0;

  try {
    // 1. Fetch package.json
    const pkgResponse = await fetch(`${baseUrl}/package.json`);
    if (pkgResponse.ok) {
      const pkgData = await pkgResponse.json();
      const pkgContent = Buffer.from(pkgData.content, 'base64').toString('utf-8');
      repoContext += `\n\n--- File: package.json ---\n${pkgContent}`;
      fileCount++;
    }

    // 2. Fetch a couple of key source files (simplified for hackathon speed constraints)
    // In a full production environment, this would walk the directory tree
    const pathsToCheck = ['src/index.js', 'src/app.js', 'server.js', 'main.py'];
    for (const path of pathsToCheck) {
      const fileRes = await fetch(`${baseUrl}/${path}`);
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        repoContext += `\n\n--- File: ${path} ---\n${content}`;
        fileCount++;
      }
    }
    
    return { repoContext, fileCount };
  } catch (error) {
    console.error('GitHub Fetch Error:', error);
    throw new Error('Failed to fetch repository data from GitHub');
  }
}

router.post('/scan', async (req: Request, res: Response) => {
  const io = (req as any).io;
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  try {
    // 1. Ingest Real Repository Data
    console.log(`[DevSecOps] Fetching live data from: ${repoUrl}`);
    const { repoContext, fileCount } = await fetchGithubRepoData(repoUrl);

    if (fileCount === 0) {
      return res.status(404).json({ error: 'No recognizable source files found in repository.' });
    }

    // 2. Feed Live Data to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log('[DevSecOps] Initiating AST Analysis on live code via Gemini 1.5 Pro...');
    
    const prompt = `${SYSTEM_PROMPT}\n\nAnalyze the following live repository data:\n${repoContext}`;
    const response = await model.generateContent(prompt);
    
    // 3. Parse and Broadcast
    const analysisResult = JSON.parse(response.response.text());
    analysisResult.files = fileCount; // Override with actual file count
    
    const finalPayload = { status: 'complete', ...analysisResult };

    // Emit live events to Orchestrator based on ACTUAL findings
    const hasCritical = analysisResult.vulnerabilities.some((v: any) => v.severity === 'CRITICAL');
    
    io.to('orchestration').emit('agent_event', {
      id: Date.now().toString(),
      type: hasCritical ? 'error' : 'success',
      agent: 'DevSecOps Agent',
      message: hasCritical 
        ? `AST Analysis complete. Critical code vulnerabilities detected in live repo.`
        : `Repository scan complete. Codebase appears secure.`,
      timestamp: new Date()
    });

    return res.json(finalPayload);

  } catch (error: any) {
    console.error('[DevSecOps] Pipeline Failed:', error);
    return res.status(500).json({ error: error.message || 'Internal analysis failure' });
  }
});

export default router;
