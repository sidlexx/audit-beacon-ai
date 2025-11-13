import { useState } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const { claims, auditCapacity, setAuditCapacity } = useAuditStore();
  const [simulatedCapacity, setSimulatedCapacity] = useState(auditCapacity);

  // What-if simulation
  const simulateROI = (capacity: number) => {
    const topClaims = [...claims]
      .sort((a, b) => b.predictedROI - a.predictedROI)
      .slice(0, capacity);
    
    const totalRecovery = topClaims.reduce((sum, c) => sum + c.recoveryPotential, 0);
    const totalEffort = topClaims.reduce((sum, c) => sum + c.estimatedEffort, 0);
    const avgROI = topClaims.reduce((sum, c) => sum + c.predictedROI, 0) / topClaims.length;
    
    return { totalRecovery, totalEffort, avgROI, claimCount: topClaims.length };
  };

  const currentMetrics = simulateROI(auditCapacity);
  const simulatedMetrics = simulateROI(simulatedCapacity);
  const improvement = ((simulatedMetrics.totalRecovery - currentMetrics.totalRecovery) / currentMetrics.totalRecovery) * 100;

  // Scatter plot data (ROI vs Amount)
  const scatterData = claims.map(c => ({
    x: c.claimAmount / 1000,
    y: c.predictedROI,
    priority: c.priority,
    name: c.claimId,
  }));

  // Provider performance
  const providerData = claims.reduce((acc, claim) => {
    if (!acc[claim.provider]) {
      acc[claim.provider] = {
        name: claim.provider,
        avgROI: 0,
        count: 0,
        total: 0,
      };
    }
    acc[claim.provider].avgROI += claim.predictedROI;
    acc[claim.provider].count++;
    acc[claim.provider].total += claim.recoveryPotential;
    return acc;
  }, {} as Record<string, any>);

  const topProviders = Object.values(providerData)
    .map((p: any) => ({
      name: p.name,
      avgROI: p.avgROI / p.count,
      recovery: p.total,
      count: p.count,
    }))
    .sort((a, b) => b.recovery - a.recovery)
    .slice(0, 10);

  // Effort vs ROI comparison
  const effortData = [
    { range: '0-10h', avgROI: claims.filter(c => c.estimatedEffort <= 10).reduce((s, c) => s + c.predictedROI, 0) / claims.filter(c => c.estimatedEffort <= 10).length },
    { range: '10-20h', avgROI: claims.filter(c => c.estimatedEffort > 10 && c.estimatedEffort <= 20).reduce((s, c) => s + c.predictedROI, 0) / claims.filter(c => c.estimatedEffort > 10 && c.estimatedEffort <= 20).length },
    { range: '20-30h', avgROI: claims.filter(c => c.estimatedEffort > 20 && c.estimatedEffort <= 30).reduce((s, c) => s + c.predictedROI, 0) / claims.filter(c => c.estimatedEffort > 20 && c.estimatedEffort <= 30).length },
    { range: '30+h', avgROI: claims.filter(c => c.estimatedEffort > 30).reduce((s, c) => s + c.predictedROI, 0) / claims.filter(c => c.estimatedEffort > 30).length },
  ];

  const exportData = () => {
    const csv = [
      ['Claim ID', 'Provider', 'Amount', 'ROI', 'Recovery', 'Priority', 'Status'].join(','),
      ...claims.map(c => [
        c.claimId,
        c.provider,
        c.claimAmount,
        c.predictedROI,
        c.recoveryPotential,
        c.priority,
        c.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-analysis-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-1">What-if simulations and deep insights</p>
        </div>
        <Button onClick={exportData} className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* What-If Simulator */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          What-If Simulator
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Audit Capacity: {simulatedCapacity} claims</Label>
              <Badge variant="outline">{simulatedCapacity === auditCapacity ? 'Current' : 'Simulated'}</Badge>
            </div>
            <Slider
              value={[simulatedCapacity]}
              onValueChange={([value]) => setSimulatedCapacity(value)}
              min={1}
              max={claims.length}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/10 border border-primary/20"
            >
              <p className="text-sm text-muted-foreground">Total Recovery</p>
              <p className="text-2xl font-bold text-primary">${(simulatedMetrics.totalRecovery / 1000000).toFixed(2)}M</p>
              {improvement !== 0 && (
                <p className={`text-xs mt-1 ${improvement > 0 ? 'text-success' : 'text-destructive'}`}>
                  {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}% vs current
                </p>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-accent/10 border border-accent/20"
            >
              <p className="text-sm text-muted-foreground">Total Effort</p>
              <p className="text-2xl font-bold text-accent">{simulatedMetrics.totalEffort.toFixed(0)}h</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-success/10 border border-success/20"
            >
              <p className="text-sm text-muted-foreground">Average ROI</p>
              <p className="text-2xl font-bold text-success">{simulatedMetrics.avgROI.toFixed(1)}%</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-warning/10 border border-warning/20"
            >
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-2xl font-bold text-warning">
                ${(simulatedMetrics.totalRecovery / simulatedMetrics.totalEffort / 1000).toFixed(0)}K/h
              </p>
            </motion.div>
          </div>

          <Button 
            onClick={() => setAuditCapacity(simulatedCapacity)}
            disabled={simulatedCapacity === auditCapacity}
            className="w-full"
          >
            Apply Capacity Change
          </Button>
        </div>
      </Card>

      {/* ROI vs Amount Scatter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">ROI vs Claim Amount Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Amount" 
              unit="K" 
              label={{ value: 'Claim Amount ($K)', position: 'bottom' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="ROI" 
              unit="%" 
              label={{ value: 'Predicted ROI (%)', angle: -90, position: 'left' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">Amount: ${data.x}K</p>
                      <p className="text-sm">ROI: {data.y}%</p>
                      <Badge className="mt-1">{data.priority}</Badge>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData} fill="hsl(var(--primary))">
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.priority === 'High' ? 'hsl(var(--success))' :
                    entry.priority === 'Medium' ? 'hsl(var(--warning))' :
                    'hsl(var(--muted-foreground))'
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Providers & Effort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Providers by Recovery</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topProviders} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="recovery" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ROI by Effort Range</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={effortData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgROI" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
