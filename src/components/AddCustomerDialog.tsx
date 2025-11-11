import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { AuditCandidate } from "./AuditTable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddCustomerDialogProps {
  onAdd: (customer: AuditCandidate) => void;
}

export const AddCustomerDialog = ({ onAdd }: AddCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    claimId: "",
    provider: "",
    claimAmount: "",
    claimComplexity: "",
    providerHistoryScore: "",
    documentationQuality: "",
    auditSuccessRate: "",
    recoveryPotential: "",
    riskLevel: "Medium" as 'High' | 'Medium' | 'Low',
    priority: "Medium" as 'High' | 'Medium' | 'Low',
    riskHandler: "",
    recommendations: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the ROI prediction function
      const { data: predictionData, error: predictionError } = await supabase.functions.invoke('predict-roi', {
        body: {
          claimAmount: parseFloat(formData.claimAmount),
          claimComplexity: parseFloat(formData.claimComplexity),
          providerHistoryScore: parseFloat(formData.providerHistoryScore),
          documentationQuality: parseFloat(formData.documentationQuality),
          auditSuccessRate: parseFloat(formData.auditSuccessRate)
        }
      });

      if (predictionError) {
        throw predictionError;
      }

      const predictedROI = predictionData.predictedROI;
      
      const newCustomer: AuditCandidate = {
        claimId: formData.claimId,
        provider: formData.provider,
        claimAmount: parseFloat(formData.claimAmount),
        claimComplexity: parseFloat(formData.claimComplexity),
        providerHistoryScore: parseFloat(formData.providerHistoryScore),
        documentationQuality: parseFloat(formData.documentationQuality),
        auditSuccessRate: parseFloat(formData.auditSuccessRate),
        predictedROI: predictedROI,
        recoveryPotential: parseFloat(formData.recoveryPotential),
        riskLevel: formData.riskLevel,
        priority: formData.priority,
        riskHandler: formData.riskHandler,
        recommendations: formData.recommendations
      };

      onAdd(newCustomer);
      toast({
        title: "Customer Added",
        description: `${formData.claimId} has been added with predicted ROI of ${predictedROI}%`
      });
      
      setFormData({
        claimId: "",
        provider: "",
        claimAmount: "",
        claimComplexity: "",
        providerHistoryScore: "",
        documentationQuality: "",
        auditSuccessRate: "",
        recoveryPotential: "",
        riskLevel: "Medium",
        priority: "Medium",
        riskHandler: "",
        recommendations: ""
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error",
        description: "Failed to predict ROI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Audit Customer</DialogTitle>
          <DialogDescription>
            Enter the details for the new audit candidate
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claimId">Claim ID *</Label>
              <Input
                id="claimId"
                required
                value={formData.claimId}
                onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                placeholder="C-10452"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider *</Label>
              <Input
                id="provider"
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Provider Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimAmount">Claim Amount *</Label>
            <Input
              id="claimAmount"
              type="number"
              required
              value={formData.claimAmount}
              onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
              placeholder="8000"
            />
          </div>

          <div className="bg-muted p-4 rounded-md space-y-4">
            <h3 className="font-semibold text-sm">ML Prediction Features</h3>
            <p className="text-xs text-muted-foreground">These features will be used to predict the ROI using machine learning</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimComplexity">Claim Complexity (1-10) *</Label>
                <Input
                  id="claimComplexity"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.claimComplexity}
                  onChange={(e) => setFormData({ ...formData, claimComplexity: e.target.value })}
                  placeholder="7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="providerHistoryScore">Provider History (1-10) *</Label>
                <Input
                  id="providerHistoryScore"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.providerHistoryScore}
                  onChange={(e) => setFormData({ ...formData, providerHistoryScore: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentationQuality">Documentation Quality (1-10) *</Label>
                <Input
                  id="documentationQuality"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={formData.documentationQuality}
                  onChange={(e) => setFormData({ ...formData, documentationQuality: e.target.value })}
                  placeholder="6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auditSuccessRate">Audit Success Rate (%) *</Label>
                <Input
                  id="auditSuccessRate"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.auditSuccessRate}
                  onChange={(e) => setFormData({ ...formData, auditSuccessRate: e.target.value })}
                  placeholder="75"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryPotential">Recovery Potential *</Label>
            <Input
              id="recoveryPotential"
              type="number"
              required
              value={formData.recoveryPotential}
              onChange={(e) => setFormData({ ...formData, recoveryPotential: e.target.value })}
              placeholder="1760"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level *</Label>
              <Select value={formData.riskLevel} onValueChange={(value: 'High' | 'Medium' | 'Low') => setFormData({ ...formData, riskLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskHandler">Risk Handler *</Label>
            <Input
              id="riskHandler"
              required
              value={formData.riskHandler}
              onChange={(e) => setFormData({ ...formData, riskHandler: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations *</Label>
            <Textarea
              id="recommendations"
              required
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Enter recommendations for this audit..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Predicting ROI..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
