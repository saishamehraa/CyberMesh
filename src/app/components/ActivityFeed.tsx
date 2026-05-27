//src/app/components/ActivityFeed.tsx
import { motion } from 'motion/react';
import { AlertTriangle, Shield, CheckCircle, XCircle, Info } from 'lucide-react';

type Activity = {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  agent: string;
  message: string;
  timestamp: Date;
};

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-info',
};

export function ActivityFeed({ activities, title = 'Activity Feed' }: ActivityFeedProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = icons[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 p-3 rounded-lg bg-accent/30 border border-border/50"
            >
              <Icon className={`size-5 flex-shrink-0 ${colors[activity.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">{activity.agent}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{activity.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
