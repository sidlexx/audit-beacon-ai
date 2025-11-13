import { useState } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, AlertCircle, Shield, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export default function AnomalyDetection() {
  const { claims, providers } = useAuditStore();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Detect anomalies
  const anomalies = claims.filter(c => c.billingPattern === 'anomaly');
  const suspicious = claims.filter(c => c.billingPattern === 'suspicious');
  const highRiskProviders = providers.filter(p => p.behaviorProfile === 'high-risk');

  // Provider risk analysis
  const providerRisks = providers.map(p => ({
    name: p.name,
    riskScore: p.riskScore,
    claimCount: p.claimCount,
    totalAmount: p.totalAmount,
    avgROI: p.auditSuccessRate,
    profile: p.behaviorProfile,
  })).sort((a, b) => b.riskScore - a.riskScore);

  // Pattern detection: unusual claim amounts
  const avgAmount = claims.reduce((sum, c) => sum + c.claimAmount, 0) / claims.length;
  const stdDev = Math.sqrt(
    claims.reduce((sum, c) => sum + Math.pow(c.claimAmount - avgAmount, 2), 0) / claims.length
  );
  const unusualAmounts = claims.filter(c => 
    Math.abs(c.claimAmount - avgAmount) > 2 * stdDev
  );

  // Radar chart data for selected provider
  const getProviderRadarData = (providerName: string) => {
    const providerClaims = claims.filter(c => c.provider === providerName);
    const avgComplexity = providerClaims.reduce((s, c) => s + c.claimComplexity, 0) / providerClaims.length;
    const avgDocQuality = providerClaims.reduce((s, c) => s + c.documentationQuality, 0) / providerClaims.length;
    const avgHistoryScore = providerClaims.reduce((s, c) => s + c.providerHistoryScore, 0) / providerClaims.length;
    const avgROI = providerClaims.reduce((s, c) => s + c.predictedROI, 0) / providerClaims.length;
    const anomalyRate = (providerClaims.filter(c => c.billingPattern === 'anomaly').length / providerClaims.length) * 100;

    return [
      { metric: 'Complexity', value: avgComplexity * 10 },
      { metric: 'Doc Quality', value: avgDocQuality * 10 },
      { metric: 'History', value: avgHistoryScore * 10 },
      { metric: 'ROI', value: avgROI },
      { metric: 'Anomaly Rate', value: anomalyRate },
    ];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        <p className="text-muted-foreground mt-1">AI-powered fraud detection and risk assessment</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Anomalies</p>
                <p className="text-3xl font-bold text-destructive mt-2">{anomalies.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires immediate review</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-warning/50 bg-warning/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious Activity</p>
                <p className="text-3xl font-bold text-warning mt-2">{suspicious.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Review recommended</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-primary/50 bg-primary/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High-Risk Providers</p>
                <p className="text-3xl font-bold text-primary mt-2">{highRiskProviders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Enhanced monitoring</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Anomaly Claims Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Critical Anomalies
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim ID</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">ROI</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Pattern</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalies.slice(0, 10).map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-medium">{claim.claimId}</TableCell>
                <TableCell>{claim.provider}</TableCell>
                <TableCell className="text-sm">{claim.claimType}</TableCell>
                <TableCell className="text-right">${claim.claimAmount.toLocaleString()}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {claim.predictedROI}%
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {claim.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">
                    Anomaly
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive">
                    Flag
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Provider Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">High-Risk Providers</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {providerRisks.slice(0, 15).map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedProvider === provider.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedProvider(provider.name)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{provider.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{provider.claimCount} claims</span>
                      <span>${(provider.totalAmount / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        provider.profile === 'high-risk'
                          ? 'bg-destructive'
                          : provider.profile === 'questionable'
                          ? 'bg-warning'
                          : 'bg-success'
                      }
                    >
                      Risk: {provider.riskScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedProvider ? `${selectedProvider} - Risk Profile` : 'Select a Provider'}
          </h3>
          {selectedProvider ? (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={getProviderRadarData(selectedProvider)}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={selectedProvider}
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a provider to view detailed risk analysis</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Unusual Amount Detection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Unusual Claim Amounts (2σ outliers)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Index" 
              label={{ value: 'Claim Index', position: 'bottom' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Amount" 
              label={{ value: 'Claim Amount ($)', angle: -90, position: 'left' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.claimId}</p>
                      <p className="text-sm">Amount: ${data.y.toLocaleString()}</p>
                      <Badge className="mt-1" variant="outline">
                        {data.isOutlier ? 'Outlier' : 'Normal'}
                      </Badge>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              data={claims.map((c, i) => ({
                x: i,
                y: c.claimAmount,
                claimId: c.claimId,
                isOutlier: unusualAmounts.includes(c),
              }))}
            >
              {claims.map((c, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={unusualAmounts.includes(c) ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4">
          Detected {unusualAmounts.length} claims with amounts significantly above or below average (±2 standard deviations)
        </p>
      </Card>
    </div>
  );
}
