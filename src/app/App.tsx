//src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AIGateway } from './pages/AIGateway';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { RepositorySecurity } from './pages/RepositorySecurity';
import { RuntimeIntelligence } from './pages/RuntimeIntelligence';
import { AutonomousOperations } from './pages/AutonomousOperations';
import { DeploymentCenter } from './pages/DeploymentCenter';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark size-full flex bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-gateway" element={<AIGateway />} />
            <Route path="/threat-intel" element={<ThreatIntelligence />} />
            <Route path="/repository" element={<RepositorySecurity />} />
            <Route path="/runtime" element={<RuntimeIntelligence />} />
            <Route path="/operations" element={<AutonomousOperations />} />
            <Route path="/deployment" element={<DeploymentCenter />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
