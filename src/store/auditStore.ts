import { create } from 'zustand';

export interface Claim {
  id: string;
  claimId: string;
  provider: string;
  providerRiskScore: number;
  claimAmount: number;
  claimComplexity: number;
  providerHistoryScore: number;
  documentationQuality: number;
  auditSuccessRate: number;
  predictedROI: number;
  recoveryPotential: number;
  estimatedEffort: number; // hours
  riskLevel: 'High' | 'Medium' | 'Low';
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
  claimType: string;
  billingPattern: 'normal' | 'suspicious' | 'anomaly';
  recommendations: string[];
}

export interface Provider {
  id: string;
  name: string;
  riskScore: number;
  claimCount: number;
  totalAmount: number;
  auditSuccessRate: number;
  behaviorProfile: 'reliable' | 'questionable' | 'high-risk';
}

interface AuditState {
  claims: Claim[];
  providers: Provider[];
  auditCapacity: number;
  selectedClaim: Claim | null;
  filters: {
    priority: string[];
    status: string[];
    riskLevel: string[];
  };
  
  // Actions
  setClaims: (claims: Claim[]) => void;
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  setSelectedClaim: (claim: Claim | null) => void;
  setAuditCapacity: (capacity: number) => void;
  setFilters: (filters: Partial<AuditState['filters']>) => void;
  assignClaim: (claimId: string, assignee: string) => void;
  completeClaim: (claimId: string) => void;
  setProviders: (providers: Provider[]) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  claims: [],
  providers: [],
  auditCapacity: 10,
  selectedClaim: null,
  filters: {
    priority: [],
    status: [],
    riskLevel: [],
  },
  
  setClaims: (claims) => set({ claims }),
  addClaim: (claim) => set((state) => ({ claims: [...state.claims, claim] })),
  updateClaim: (id, updates) =>
    set((state) => ({
      claims: state.claims.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  setSelectedClaim: (claim) => set({ selectedClaim: claim }),
  setAuditCapacity: (capacity) => set({ auditCapacity: capacity }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  assignClaim: (claimId, assignee) =>
    set((state) => ({
      claims: state.claims.map((c) =>
        c.id === claimId ? { ...c, assignedTo: assignee, status: 'in-progress' } : c
      ),
    })),
  completeClaim: (claimId) =>
    set((state) => ({
      claims: state.claims.map((c) =>
        c.id === claimId ? { ...c, status: 'completed', completedAt: new Date() } : c
      ),
    })),
  setProviders: (providers) => set({ providers }),
}));
