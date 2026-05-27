//src/app/components/MetricCard.tsx
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'cyan';
}

export function MetricCard({ title, value, change, icon: Icon, trend = 'neutral', color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-cyber-blue border-cyber-blue/20 bg-cyber-blue/5',
    green: 'text-cyber-green border-cyber-green/20 bg-cyber-green/5',
    red: 'text-cyber-red border-cyber-red/20 bg-cyber-red/5',
    purple: 'text-cyber-purple border-cyber-purple/20 bg-cyber-purple/5',
    cyan: 'text-cyber-cyan border-cyber-cyan/20 bg-cyber-cyan/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg border ${colorClasses[color]} backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <span className={`text-xs ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <Icon className="size-8" />
          <div className="absolute inset-0 blur-lg opacity-50">
            <Icon className="size-8" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
