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
    predictedROI: "",
    recoveryPotential: "",
    riskLevel: "Medium" as 'High' | 'Medium' | 'Low',
    priority: "Medium" as 'High' | 'Medium' | 'Low',
    riskHandler: "",
    recommendations: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCustomer: AuditCandidate = {
      claimId: formData.claimId,
      provider: formData.provider,
      claimAmount: parseFloat(formData.claimAmount),
      predictedROI: parseFloat(formData.predictedROI),
      recoveryPotential: parseFloat(formData.recoveryPotential),
      riskLevel: formData.riskLevel,
      priority: formData.priority,
      riskHandler: formData.riskHandler,
      recommendations: formData.recommendations
    };

    onAdd(newCustomer);
    toast({
      title: "Customer Added",
      description: `${formData.claimId} has been added successfully.`
    });
    
    setFormData({
      claimId: "",
      provider: "",
      claimAmount: "",
      predictedROI: "",
      recoveryPotential: "",
      riskLevel: "Medium",
      priority: "Medium",
      riskHandler: "",
      recommendations: ""
    });
    setOpen(false);
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

          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="predictedROI">Predicted ROI (%) *</Label>
              <Input
                id="predictedROI"
                type="number"
                required
                value={formData.predictedROI}
                onChange={(e) => setFormData({ ...formData, predictedROI: e.target.value })}
                placeholder="22"
              />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
