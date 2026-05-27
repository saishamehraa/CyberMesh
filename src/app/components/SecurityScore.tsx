//src/app/components/SecurityScore.tsx
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SecurityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SecurityScore({ score, size = 'lg' }: SecurityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const getColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getStatus = (score: number) => {
    if (score >= 80) return 'SECURE';
    if (score >= 60) return 'WARNING';
    return 'CRITICAL';
  };

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (animatedScore / 100) * circumference;

  const sizes = {
    sm: { container: 'size-24', text: 'text-xl', label: 'text-xs' },
    md: { container: 'size-32', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'size-48', text: 'text-5xl', label: 'text-base' },
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={sizes[size].container} viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={getColor(score)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className={`font-bold ${sizes[size].text} ${getColor(score)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedScore}
        </motion.div>
        <div className={`${sizes[size].label} text-muted-foreground font-medium`}>
          {getStatus(score)}
        </div>
      </div>
      <div className={`absolute inset-0 blur-2xl ${getColor(score)} opacity-20`} />
    </div>
  );
}
