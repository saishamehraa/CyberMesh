//src/app/components/ThreatCard.tsx
import { motion } from 'motion/react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

type Threat = {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  affectedPackage?: string;
  publishedDate: Date;
  cvss?: number;
};

interface ThreatCardProps {
  threat: Threat;
}

const severityColors = {
  CRITICAL: 'border-destructive text-destructive bg-destructive/10',
  HIGH: 'border-warning text-warning bg-warning/10',
  MEDIUM: 'border-info text-info bg-info/10',
  LOW: 'border-success text-success bg-success/10',
};

export function ThreatCard({ threat }: ThreatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-warning" />
          <span className="font-mono text-sm font-semibold">{threat.cve}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium border ${severityColors[threat.severity]}`}>
          {threat.severity}
        </span>
      </div>

      <h4 className="text-sm font-medium mb-2 line-clamp-2">{threat.title}</h4>

      {threat.affectedPackage && (
        <div className="text-xs text-muted-foreground mb-2">
          Package: <span className="font-mono text-foreground">{threat.affectedPackage}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{threat.publishedDate.toLocaleDateString()}</span>
        {threat.cvss && (
          <span className="font-medium">CVSS: {threat.cvss.toFixed(1)}</span>
        )}
        <ExternalLink className="size-3" />
      </div>
    </motion.div>
  );
}
