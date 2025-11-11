import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { AuditCandidate } from "./AuditTable";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface UploadExcelDialogProps {
  onUpload: (customers: AuditCandidate[]) => void;
}

const REQUIRED_COLUMNS = [
  "Claim ID",
  "Provider",
  "Claim Amount",
  "Claim Complexity",
  "Provider History Score",
  "Documentation Quality",
  "Audit Success Rate",
  "Recovery Potential",
  "Risk Level",
  "Priority",
  "Risk Handler",
  "Recommendations"
];

export const UploadExcelDialog = ({ onUpload }: UploadExcelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFormat = (headers: string[]): boolean => {
    return REQUIRED_COLUMNS.every(col => headers.includes(col));
  };

  const parseExcelFile = async (file: File) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast({
            title: "Invalid Format",
            description: "The Excel file must contain headers and at least one data row.",
            variant: "destructive"
          });
          return;
        }

        const headers = jsonData[0] as string[];
        
        if (!validateFormat(headers)) {
          toast({
            title: "Invalid Format",
            description: `Required columns: ${REQUIRED_COLUMNS.join(", ")}`,
            variant: "destructive"
          });
          return;
        }

        const customers: AuditCandidate[] = [];
        
        toast({
          title: "Processing",
          description: `Predicting ROI for ${jsonData.length - 1} customer(s)...`
        });

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const claimAmount = Number(row[headers.indexOf("Claim Amount")] || 0);
          const claimComplexity = Number(row[headers.indexOf("Claim Complexity")] || 5);
          const providerHistoryScore = Number(row[headers.indexOf("Provider History Score")] || 5);
          const documentationQuality = Number(row[headers.indexOf("Documentation Quality")] || 5);
          const auditSuccessRate = Number(row[headers.indexOf("Audit Success Rate")] || 50);

          // Call ROI prediction for each row
          const { data: predictionData, error: predictionError } = await supabase.functions.invoke('predict-roi', {
            body: {
              claimAmount,
              claimComplexity,
              providerHistoryScore,
              documentationQuality,
              auditSuccessRate
            }
          });

          if (predictionError) {
            console.error("Prediction error for row", i, predictionError);
            continue;
          }

          const customer: AuditCandidate = {
            claimId: String(row[headers.indexOf("Claim ID")] || ""),
            provider: String(row[headers.indexOf("Provider")] || ""),
            claimAmount,
            claimComplexity,
            providerHistoryScore,
            documentationQuality,
            auditSuccessRate,
            predictedROI: predictionData.predictedROI,
            recoveryPotential: Number(row[headers.indexOf("Recovery Potential")] || 0),
            riskLevel: (row[headers.indexOf("Risk Level")] || "Medium") as 'High' | 'Medium' | 'Low',
            priority: (row[headers.indexOf("Priority")] || "Medium") as 'High' | 'Medium' | 'Low',
            riskHandler: String(row[headers.indexOf("Risk Handler")] || ""),
            recommendations: String(row[headers.indexOf("Recommendations")] || "")
          };

          customers.push(customer);
        }

        if (customers.length === 0) {
          toast({
            title: "No Data",
            description: "No valid customer data found in the Excel file.",
            variant: "destructive"
          });
          return;
        }

        onUpload(customers);
        toast({
          title: "Upload Successful",
          description: `${customers.length} customer(s) imported with AI-predicted ROI.`
        });
        setOpen(false);
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to parse the Excel file. Please check the format.",
          variant: "destructive"
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        return;
      }
      parseExcelFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
        return;
      }
      parseExcelFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Customer Data</DialogTitle>
          <DialogDescription>
            Upload an Excel file with customer audit data. The file must include these columns:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-semibold mb-2">Required Columns:</p>
            <ul className="list-disc list-inside space-y-1">
              {REQUIRED_COLUMNS.map(col => (
                <li key={col}>{col}</li>
              ))}
            </ul>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your Excel file here, or click to browse
            </p>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              Select File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
