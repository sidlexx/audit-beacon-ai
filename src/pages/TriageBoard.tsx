import { useState } from 'react';
import { useAuditStore } from '@/store/auditStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Claim } from '@/store/auditStore';
import { AlertCircle, Clock, DollarSign, TrendingUp, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const COLUMNS = [
  { id: 'pending', title: 'Pending Review', color: 'from-slate-500 to-slate-600' },
  { id: 'in-progress', title: 'In Progress', color: 'from-primary to-accent' },
  { id: 'completed', title: 'Completed', color: 'from-success to-success/70' },
];

function ClaimCard({ claim, isOverlay = false }: { claim: Claim; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: claim.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    High: 'bg-success text-success-foreground',
    Medium: 'bg-warning text-warning-foreground',
    Low: 'bg-muted text-muted-foreground',
  };

  const riskColors = {
    High: 'border-destructive/50 bg-destructive/5',
    Medium: 'border-warning/50 bg-warning/5',
    Low: 'border-success/50 bg-success/5',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all ${
        riskColors[claim.riskLevel]
      } ${isOverlay ? 'rotate-3 shadow-2xl' : ''}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{claim.claimId}</p>
            <p className="text-xs text-muted-foreground">{claim.provider}</p>
          </div>
          <Badge className={priorityColors[claim.priority]} variant="default">
            {claim.priority}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-muted-foreground" />
            <span>${(claim.claimAmount / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="font-semibold text-success">{claim.predictedROI}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span>{claim.estimatedEffort}h</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-muted-foreground" />
            <span>{claim.riskLevel}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {claim.recommendations[0]}
          </p>
        </div>

        {claim.assignedTo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{claim.assignedTo}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function TriageBoard() {
  const { claims, updateClaim, assignClaim } = useAuditStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [assignee, setAssignee] = useState('');
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const claim = claims.find(c => c.id === active.id);
      const newStatus = COLUMNS.find(col => 
        claims.find(c => c.id === over.id)?.status === col.id
      )?.id;

      if (claim && newStatus) {
        updateClaim(claim.id, { status: newStatus as Claim['status'] });
        toast({
          title: 'Claim Updated',
          description: `Moved to ${newStatus.replace('-', ' ')}`,
        });
      }
    }
    
    setActiveId(null);
  };

  const handleAssign = () => {
    if (selectedClaim && assignee) {
      assignClaim(selectedClaim.id, assignee);
      toast({
        title: 'Claim Assigned',
        description: `Assigned to ${assignee}`,
      });
      setSelectedClaim(null);
      setAssignee('');
    }
  };

  const activeClaim = claims.find(c => c.id === activeId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Triage Board</h1>
        <p className="text-muted-foreground mt-1">Drag and drop claims to manage workflow</p>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnClaims = claims.filter(c => c.status === column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                <Card className={`p-4 bg-gradient-to-r ${column.color}`}>
                  <div className="flex items-center justify-between text-white">
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {columnClaims.length}
                    </Badge>
                  </div>
                </Card>

                <SortableContext
                  items={columnClaims.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <motion.div 
                    className="space-y-3 min-h-[400px]"
                    layout
                  >
                    {columnClaims.map((claim) => (
                      <motion.div
                        key={claim.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <ClaimCard claim={claim} />
                      </motion.div>
                    ))}
                  </motion.div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeClaim ? <ClaimCard claim={activeClaim} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details - {selectedClaim?.claimId}</DialogTitle>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Provider</Label>
                  <p className="font-medium">{selectedClaim.provider}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Claim Type</Label>
                  <p className="font-medium">{selectedClaim.claimType}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Claim Amount</Label>
                  <p className="font-medium">${selectedClaim.claimAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Recovery Potential</Label>
                  <p className="font-medium text-success">${selectedClaim.recoveryPotential.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Predicted ROI</Label>
                  <p className="font-medium text-primary">{selectedClaim.predictedROI}%</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estimated Effort</Label>
                  <p className="font-medium">{selectedClaim.estimatedEffort} hours</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Recommendations</Label>
                <ul className="mt-2 space-y-1">
                  {selectedClaim.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-primary" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To</Label>
                <div className="flex gap-2">
                  <Input
                    id="assignee"
                    placeholder="Enter auditor name"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                  <Button onClick={handleAssign}>Assign</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
