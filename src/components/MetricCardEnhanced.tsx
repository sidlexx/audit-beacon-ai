import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricCardEnhancedProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  colorClass?: string;
}

export const MetricCardEnhanced = ({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  subtitle,
  colorClass = 'from-primary to-accent'
}: MetricCardEnhancedProps) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <motion.p 
                className="text-3xl font-bold"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.p>
              {change !== undefined && (
                <span className={cn('text-sm font-medium', trendColor)}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
            colorClass
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
