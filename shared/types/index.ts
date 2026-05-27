// shared/types/index.ts
export type RiskLevel = 'SAFE' | 'WARNING' | 'BLOCKED';
export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Threat {
  id: string;
  cve: string;
  severity: ThreatSeverity;
  title: string;
  affectedPackage?: string;
  publishedDate: Date;
  cvss?: number;
}

export interface ActivityEvent {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  agent: string;
  message: string;
  timestamp: Date;
}
