import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { AuditTable, AuditCandidate } from "@/components/AuditTable";
import { ROIChart } from "@/components/ROIChart";
import { AddCustomerDialog } from "@/components/AddCustomerDialog";
import { UploadExcelDialog } from "@/components/UploadExcelDialog";
import { DollarSign, TrendingUp, Target, Activity } from "lucide-react";

const initialData: AuditCandidate[] = [
  {
    claimId: "C-10452",
    provider: "Provider A",
    claimAmount: 8000,
    claimComplexity: 8,
    providerHistoryScore: 4,
    documentationQuality: 5,
    auditSuccessRate: 85,
    predictedROI: 22,
    recoveryPotential: 1760,
    riskLevel: "High",
    priority: "High",
    riskHandler: "Sarah Johnson",
    recommendations: "Immediate review recommended due to high recovery potential and risk level"
  },
  {
    claimId: "C-10689",
    provider: "Provider B",
    claimAmount: 14500,
    claimComplexity: 3,
    providerHistoryScore: 8,
    documentationQuality: 9,
    auditSuccessRate: 45,
    predictedROI: 5,
    recoveryPotential: 725,
    riskLevel: "Low",
    priority: "Low",
    riskHandler: "Mike Chen",
    recommendations: "Standard review process, low priority queue"
  },
  {
    claimId: "C-10723",
    provider: "Provider C",
    claimAmount: 6200,
    claimComplexity: 6,
    providerHistoryScore: 6,
    documentationQuality: 6,
    auditSuccessRate: 70,
    predictedROI: 18,
    recoveryPotential: 1116,
    riskLevel: "Medium",
    priority: "Medium",
    riskHandler: "Emily Davis",
    recommendations: "Schedule within 2 weeks, moderate recovery expected"
  },
  {
    claimId: "C-10801",
    provider: "Provider D",
    claimAmount: 21000,
    claimComplexity: 9,
    providerHistoryScore: 3,
    documentationQuality: 4,
    auditSuccessRate: 90,
    predictedROI: 27,
    recoveryPotential: 5670,
    riskLevel: "High",
    priority: "High",
    riskHandler: "Sarah Johnson",
    recommendations: "Priority audit, significant recovery potential identified"
  },
  {
    claimId: "C-10978",
    provider: "Provider E",
    claimAmount: 3900,
    claimComplexity: 2,
    providerHistoryScore: 9,
    documentationQuality: 8,
    auditSuccessRate: 30,
    predictedROI: 3,
    recoveryPotential: 117,
    riskLevel: "Low",
    priority: "Low",
    riskHandler: "Tom Wilson",
    recommendations: "Low value case, minimal resources allocation"
  },
  {
    claimId: "C-11045",
    provider: "Provider F",
    claimAmount: 12800,
    claimComplexity: 5,
    providerHistoryScore: 5,
    documentationQuality: 7,
    auditSuccessRate: 65,
    predictedROI: 15,
    recoveryPotential: 1920,
    riskLevel: "Medium",
    priority: "Medium",
    riskHandler: "Emily Davis",
    recommendations: "Review billing documentation, potential coding errors"
  },
  {
    claimId: "C-11132",
    provider: "Provider G",
    claimAmount: 18500,
    claimComplexity: 8,
    providerHistoryScore: 4,
    documentationQuality: 5,
    auditSuccessRate: 82,
    predictedROI: 24,
    recoveryPotential: 4440,
    riskLevel: "High",
    priority: "High",
    riskHandler: "Sarah Johnson",
    recommendations: "Complex case requiring senior auditor review"
  },
  {
    claimId: "C-11289",
    provider: "Provider H",
    claimAmount: 5600,
    claimComplexity: 4,
    providerHistoryScore: 7,
    documentationQuality: 7,
    auditSuccessRate: 50,
    predictedROI: 8,
    recoveryPotential: 448,
    riskLevel: "Low",
    priority: "Low",
    riskHandler: "Tom Wilson",
    recommendations: "Routine check, no urgent action required"
  },
];

const Index = () => {
  const [auditData, setAuditData] = useState<AuditCandidate[]>(initialData);

  const totalAudits = auditData.length;
  const averageROI = (auditData.reduce((sum, item) => sum + item.predictedROI, 0) / totalAudits).toFixed(1);
  const totalRecovery = auditData.reduce((sum, item) => sum + item.recoveryPotential, 0);
  const highPriorityCount = auditData.filter(item => item.priority === "High").length;
  const efficiencyRatio = ((totalRecovery / (totalAudits * 500)) * 100).toFixed(1);

  const chartData = [
    {
      priority: "High",
      count: auditData.filter(item => item.priority === "High").length,
      totalRecovery: auditData.filter(item => item.priority === "High").reduce((sum, item) => sum + item.recoveryPotential, 0)
    },
    {
      priority: "Medium",
      count: auditData.filter(item => item.priority === "Medium").length,
      totalRecovery: auditData.filter(item => item.priority === "Medium").reduce((sum, item) => sum + item.recoveryPotential, 0)
    },
    {
      priority: "Low",
      count: auditData.filter(item => item.priority === "Low").length,
      totalRecovery: auditData.filter(item => item.priority === "Low").reduce((sum, item) => sum + item.recoveryPotential, 0)
    },
  ];

  const handleAddCustomer = (customer: AuditCandidate) => {
    setAuditData(prev => [...prev, customer]);
  };

  const handleUploadCustomers = (customers: AuditCandidate[]) => {
    setAuditData(prev => [...prev, ...customers]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Audit ROI Predictor</h1>
          <p className="text-muted-foreground text-lg">AI-powered audit optimization and ROI prediction platform</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Audits"
            value={totalAudits.toString()}
            subtitle={`${highPriorityCount} high priority`}
            icon={Activity}
            trend={{ value: "12%", isPositive: true }}
          />
          <MetricCard
            title="Average ROI"
            value={`${averageROI}%`}
            subtitle="Predicted return"
            icon={TrendingUp}
            trend={{ value: "3.2%", isPositive: true }}
          />
          <MetricCard
            title="Total Recovery"
            value={`$${totalRecovery.toLocaleString()}`}
            subtitle="Projected amount"
            icon={DollarSign}
            trend={{ value: "8.5%", isPositive: true }}
          />
          <MetricCard
            title="Efficiency Ratio"
            value={`${efficiencyRatio}%`}
            subtitle="Recovery vs. cost"
            icon={Target}
            trend={{ value: "5.1%", isPositive: true }}
          />
        </div>

        {/* Chart */}
        <ROIChart data={chartData} />

        {/* Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audit Candidates</h2>
              <p className="text-sm text-muted-foreground">Click column headers to sort</p>
            </div>
            <div className="flex gap-2">
              <AddCustomerDialog onAdd={handleAddCustomer} />
              <UploadExcelDialog onUpload={handleUploadCustomers} />
            </div>
          </div>
          <AuditTable data={auditData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
