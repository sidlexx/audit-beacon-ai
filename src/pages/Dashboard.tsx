import { useEffect, useState } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { generateClaims, generateProviders, streamNewClaim } from '@/utils/dataSimulator';
import { MetricCardEnhanced } from '@/components/MetricCardEnhanced';
import { DollarSign, TrendingUp, Clock, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const { claims, providers, setClaims, setProviders, addClaim } = useAuditStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize data
    const initialClaims = generateClaims(50);
    setClaims(initialClaims);
    setProviders(generateProviders(initialClaims));
    setLoading(false);

    // Set up real-time streaming
    const unsubscribe = streamNewClaim((newClaim) => {
      addClaim(newClaim);
    });

    return unsubscribe;
  }, [setClaims, setProviders, addClaim]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalValue = claims.reduce((sum, c) => sum + c.claimAmount, 0);
  const totalRecovery = claims.reduce((sum, c) => sum + c.recoveryPotential, 0);
  const avgROI = claims.reduce((sum, c) => sum + c.predictedROI, 0) / claims.length;
  const highPriority = claims.filter(c => c.priority === 'High').length;
  const completed = claims.filter(c => c.status === 'completed').length;
  const inProgress = claims.filter(c => c.status === 'in-progress').length;
  const completionRate = (completed / claims.length) * 100;

  // ROI Distribution Data
  const roiDistribution = [
    { name: 'High (>70%)', value: claims.filter(c => c.predictedROI > 70).length, color: 'hsl(var(--success))' },
    { name: 'Medium (40-70%)', value: claims.filter(c => c.predictedROI >= 40 && c.predictedROI <= 70).length, color: 'hsl(var(--warning))' },
    { name: 'Low (<40%)', value: claims.filter(c => c.predictedROI < 40).length, color: 'hsl(var(--destructive))' },
  ];

  // Trend data (last 7 days simulation)
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    roi: 45 + Math.random() * 30,
    claims: 5 + Math.floor(Math.random() * 10),
  }));

  // Priority distribution
  const priorityData = [
    { name: 'High', value: claims.filter(c => c.priority === 'High').length },
    { name: 'Medium', value: claims.filter(c => c.priority === 'Medium').length },
    { name: 'Low', value: claims.filter(c => c.priority === 'Low').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Audit Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Real-time ML-powered audit prioritization and ROI optimization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCardEnhanced
          title="Total Claims Value"
          value={`$${(totalValue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          colorClass="from-primary to-primary/70"
          change={12}
          trend="up"
        />
        <MetricCardEnhanced
          title="Predicted Recovery"
          value={`$${(totalRecovery / 1000000).toFixed(1)}M`}
          icon={TrendingUp}
          colorClass="from-success to-success/70"
          change={8}
          trend="up"
        />
        <MetricCardEnhanced
          title="Average ROI"
          value={`${avgROI.toFixed(1)}%`}
          icon={TrendingUp}
          colorClass="from-accent to-accent/70"
          subtitle="ML Predicted"
        />
        <MetricCardEnhanced
          title="High Priority"
          value={highPriority}
          icon={AlertCircle}
          colorClass="from-warning to-warning/70"
          subtitle={`of ${claims.length} total`}
        />
        <MetricCardEnhanced
          title="In Progress"
          value={inProgress}
          icon={Clock}
          colorClass="from-primary to-accent"
          subtitle={`${completed} completed`}
        />
        <MetricCardEnhanced
          title="Providers"
          value={providers.length}
          icon={Users}
          colorClass="from-chart-2 to-chart-3"
          subtitle="Active networks"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ROI Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Distribution Pie */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ROI Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={roiDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {roiDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {roiDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Completion Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Completion</span>
                <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <Badge variant="default" className="bg-success">{completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="default" className="bg-primary">{inProgress}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <Badge variant="secondary">{claims.filter(c => c.status === 'pending').length}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start gap-2" 
              onClick={() => navigate('/triage')}
            >
              <CheckCircle className="w-4 h-4" />
              Start Triaging Claims
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/analytics')}
            >
              <BarChart className="w-4 h-4" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/anomalies')}
            >
              <AlertCircle className="w-4 h-4" />
              Check Anomalies
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
