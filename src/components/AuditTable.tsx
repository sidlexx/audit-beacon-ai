import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

export interface AuditCandidate {
  claimId: string;
  provider: string;
  claimAmount: number;
  predictedROI: number;
  recoveryPotential: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  priority: 'High' | 'Medium' | 'Low';
  riskHandler: string;
  recommendations: string;
}

interface AuditTableProps {
  data: AuditCandidate[];
}

export const AuditTable = ({ data }: AuditTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof AuditCandidate; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (key: keyof AuditCandidate) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'Low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim ID</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">
              <button 
                onClick={() => handleSort('claimAmount')}
                className="flex items-center gap-1 ml-auto hover:text-foreground"
              >
                Claim Amount
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button 
                onClick={() => handleSort('predictedROI')}
                className="flex items-center gap-1 ml-auto hover:text-foreground"
              >
                Predicted ROI
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button 
                onClick={() => handleSort('recoveryPotential')}
                className="flex items-center gap-1 ml-auto hover:text-foreground"
              >
                Recovery Potential
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Risk Handler</TableHead>
            <TableHead>Recommendations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((audit) => (
            <TableRow key={audit.claimId} className="hover:bg-muted/50">
              <TableCell className="font-medium">{audit.claimId}</TableCell>
              <TableCell>{audit.provider}</TableCell>
              <TableCell className="text-right">${audit.claimAmount.toLocaleString()}</TableCell>
              <TableCell className="text-right font-semibold text-primary">{audit.predictedROI}%</TableCell>
              <TableCell className="text-right font-semibold text-accent">${audit.recoveryPotential.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getRiskColor(audit.riskLevel)}>
                  {audit.riskLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(audit.priority)}>
                  {audit.priority}
                </Badge>
              </TableCell>
              <TableCell>{audit.riskHandler}</TableCell>
              <TableCell className="max-w-xs truncate" title={audit.recommendations}>
                {audit.recommendations}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
