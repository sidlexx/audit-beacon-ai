import { Claim, Provider } from '@/store/auditStore';

const PROVIDERS = [
  'MediCare Plus', 'HealthFirst', 'CareWell', 'MedTech Solutions', 'Wellness Corp',
  'Prime Health', 'Unity Medical', 'Guardian Health', 'Apex Care', 'Vital Medical',
  'Summit Health', 'Horizon Care', 'Beacon Medical', 'Nova Health', 'Sterling Care',
  'Precision Health', 'Alliance Medical', 'Phoenix Care', 'Clarity Health', 'Triumph Medical'
];

const CLAIM_TYPES = [
  'Inpatient Surgery', 'Outpatient Procedure', 'Emergency Visit', 'Specialist Consultation',
  'Diagnostic Imaging', 'Laboratory Tests', 'Physical Therapy', 'Mental Health',
  'Preventive Care', 'Chronic Disease Management'
];

const RISK_HANDLERS = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Park', 'Lisa Anderson'
];

function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateBillingPattern(): 'normal' | 'suspicious' | 'anomaly' {
  const rand = Math.random();
  if (rand > 0.85) return 'anomaly';
  if (rand > 0.70) return 'suspicious';
  return 'normal';
}

function calculateRiskLevel(complexity: number, historyScore: number, docQuality: number): 'High' | 'Medium' | 'Low' {
  const riskScore = complexity - (historyScore + docQuality) / 2;
  if (riskScore > 3) return 'High';
  if (riskScore > 0) return 'Medium';
  return 'Low';
}

function calculatePriority(roi: number, amount: number, riskLevel: string): 'High' | 'Medium' | 'Low' {
  if (roi > 70 && amount > 50000) return 'High';
  if (roi > 50 || (amount > 30000 && riskLevel === 'High')) return 'High';
  if (roi > 30) return 'Medium';
  return 'Low';
}

function generateRecommendations(claim: Partial<Claim>): string[] {
  const recommendations: string[] = [];
  
  if (claim.claimComplexity && claim.claimComplexity > 7) {
    recommendations.push('Assign to senior auditor due to complexity');
  }
  if (claim.documentationQuality && claim.documentationQuality < 4) {
    recommendations.push('Request additional documentation from provider');
  }
  if (claim.providerHistoryScore && claim.providerHistoryScore < 4) {
    recommendations.push('Review provider history for patterns');
  }
  if (claim.predictedROI && claim.predictedROI > 80) {
    recommendations.push('High recovery potential - prioritize immediately');
  }
  if (claim.billingPattern === 'anomaly') {
    recommendations.push('Flag for fraud investigation');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Standard audit procedures apply');
  }
  
  return recommendations;
}

export function generateClaims(count: number = 50): Claim[] {
  const claims: Claim[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const claimAmount = generateRandomInt(5000, 150000);
    const claimComplexity = generateRandomInt(1, 10);
    const providerHistoryScore = generateRandomInt(1, 10);
    const documentationQuality = generateRandomInt(1, 10);
    const auditSuccessRate = generateRandomFloat(20, 95);
    const billingPattern = generateBillingPattern();
    
    // Add temporal variation (older claims have slightly lower scores)
    const daysOld = generateRandomInt(0, 90);
    const createdAt = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);
    const ageDecay = 1 - (daysOld / 180); // Decay factor
    
    // Simulated ML prediction with realistic patterns
    const baseROI = (claimComplexity * 8) - (providerHistoryScore * 3) - (documentationQuality * 2) + (auditSuccessRate / 2);
    const predictedROI = Math.max(15, Math.min(95, baseROI * ageDecay + generateRandomFloat(-5, 5)));
    
    const recoveryPotential = Math.round(claimAmount * (predictedROI / 100));
    const estimatedEffort = generateRandomFloat(2, 40, 1);
    
    const riskLevel = calculateRiskLevel(claimComplexity, providerHistoryScore, documentationQuality);
    const priority = calculatePriority(predictedROI, claimAmount, riskLevel);
    
    const providerRiskScore = generateRandomFloat(1, 10, 1);
    
    const claim: Claim = {
      id: `claim-${Date.now()}-${i}`,
      claimId: `CLM-${String(1000 + i).padStart(6, '0')}`,
      provider: PROVIDERS[generateRandomInt(0, PROVIDERS.length - 1)],
      providerRiskScore,
      claimAmount,
      claimComplexity,
      providerHistoryScore,
      documentationQuality,
      auditSuccessRate,
      predictedROI: parseFloat(predictedROI.toFixed(1)),
      recoveryPotential,
      estimatedEffort,
      riskLevel,
      priority,
      status: 'pending',
      createdAt,
      claimType: CLAIM_TYPES[generateRandomInt(0, CLAIM_TYPES.length - 1)],
      billingPattern,
      recommendations: [],
    };
    
    claim.recommendations = generateRecommendations(claim);
    claims.push(claim);
  }
  
  return claims.sort((a, b) => {
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (b.priority === 'High' && a.priority !== 'High') return 1;
    return b.predictedROI - a.predictedROI;
  });
}

export function generateProviders(claims: Claim[]): Provider[] {
  const providerMap = new Map<string, Provider>();
  
  claims.forEach(claim => {
    if (!providerMap.has(claim.provider)) {
      providerMap.set(claim.provider, {
        id: `provider-${claim.provider.replace(/\s/g, '-').toLowerCase()}`,
        name: claim.provider,
        riskScore: claim.providerRiskScore,
        claimCount: 0,
        totalAmount: 0,
        auditSuccessRate: 0,
        behaviorProfile: 'reliable',
      });
    }
    
    const provider = providerMap.get(claim.provider)!;
    provider.claimCount++;
    provider.totalAmount += claim.claimAmount;
    provider.auditSuccessRate += claim.auditSuccessRate;
  });
  
  const providers = Array.from(providerMap.values()).map(provider => {
    provider.auditSuccessRate = provider.auditSuccessRate / provider.claimCount;
    
    if (provider.riskScore > 7 || provider.auditSuccessRate < 50) {
      provider.behaviorProfile = 'high-risk';
    } else if (provider.riskScore > 4 || provider.auditSuccessRate < 70) {
      provider.behaviorProfile = 'questionable';
    }
    
    return provider;
  });
  
  return providers.sort((a, b) => b.riskScore - a.riskScore);
}

export function streamNewClaim(callback: (claim: Claim) => void): () => void {
  const interval = setInterval(() => {
    const [newClaim] = generateClaims(1);
    callback(newClaim);
  }, generateRandomInt(10000, 30000)); // New claim every 10-30 seconds
  
  return () => clearInterval(interval);
}
