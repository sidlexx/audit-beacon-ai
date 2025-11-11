import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ROIChartProps {
  data: Array<{
    priority: string;
    count: number;
    totalRecovery: number;
  }>;
}

export const ROIChart = ({ data }: ROIChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">ROI Distribution by Priority</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="priority" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'totalRecovery') return [`$${value.toLocaleString()}`, 'Total Recovery'];
              return [value, 'Audit Count'];
            }}
          />
          <Legend />
          <Bar dataKey="count" name="Audit Count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="totalRecovery" name="Total Recovery" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
