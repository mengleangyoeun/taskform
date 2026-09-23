"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Table,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { exportToDocx } from "@/lib/export/docx-export";
import { exportToPdf } from "@/lib/export/pdf-export";
import { exportToImage } from "@/lib/export/image-export";
import { exportToJson, exportToCsv, parseWorkspaceJson } from "@/lib/export/data-export";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceWithDetails | null;
  settings: DocumentSettings;
  onImportWorkspace?: (imported: WorkspaceWithDetails) => void;
}

export function ExportModal({
  open,
  onOpenChange,
  workspace,
  settings,
  onImportWorkspace,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"document" | "data" | "import">("document");
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!workspace) return null;

  const handleExportDocx = async () => {
    try {
      setExporting("docx");
      setError(null);
      await exportToDocx(workspace, settings);
      setSuccessMessage("DOCX exported successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate DOCX document";
      setError(msg);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting("pdf");
      setError(null);
      await exportToPdf("printable-document-sheet", workspace.name, settings);
      setSuccessMessage("PDF exported successfully!");
    } catch {
      setError(
        "Could not generate PDF directly from DOM. Make sure you are in Document Preview mode, or use Print -> Save as PDF."
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportImage = async (format: "png" | "jpeg") => {
    try {
      setExporting(format);
      setError(null);
      await exportToImage("printable-document-sheet", workspace.name, format);
      setSuccessMessage(`${format.toUpperCase()} image exported successfully!`);
    } catch {
      setError(
        `Could not generate ${format.toUpperCase()}. Please switch to Document Preview tab first.`
      );
    } finally {
      setExporting(null);
    }
  };

  const handleExportJson = () => {
    try {
      exportToJson(workspace);
      setSuccessMessage("JSON data exported!");
    } catch {
      setError("Failed to export JSON");
    }
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(workspace);
      setSuccessMessage("CSV spreadsheet exported!");
    } catch {
      setError("Failed to export CSV");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseWorkspaceJson(content);
        onImportWorkspace?.(parsed);
        setSuccessMessage(`Workspace "${parsed.name}" imported successfully!`);
        setTimeout(() => onOpenChange(false), 1500);
      } catch {
        setError("Invalid JSON format. Please select a valid TaskForm JSON export.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Export & Share</span>
          </DialogTitle>
          <DialogDescription>
            Export your workspace in printable document formats or raw structured data.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switchers */}
        <div className="flex border-b border-border/50 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab("document");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "document"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Presentation & Document
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("data");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "data"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Data Backup (JSON / CSV)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("import");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "import"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Import JSON
          </button>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Presentation & Document */}
        {activeTab === "document" && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Generate formatted documents matching your template settings.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* DOCX Button */}
              <button
                type="button"
                onClick={handleExportDocx}
                disabled={!!exporting}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {exporting === "docx" && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="font-semibold text-xs">Microsoft Word (.docx)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Real editable document with tables, headers, and checkboxes.
                </div>
              </button>

              {/* PDF Button */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={!!exporting}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-red-600" />
                  {exporting === "pdf" && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="font-semibold text-xs">PDF Document (.pdf)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  High-DPI print-ready PDF matching active paper preview.
                </div>
              </button>

              {/* PNG Button */}
              <button
                type="button"
                onClick={() => handleExportImage("png")}
                disabled={!!exporting}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                  {exporting === "png" && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="font-semibold text-xs">PNG Image (.png)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Lossless image for sharing, digital notes, and presentations.
                </div>
              </button>

              {/* JPG Button */}
              <button
                type="button"
                onClick={() => handleExportImage("jpeg")}
                disabled={!!exporting}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  {exporting === "jpeg" && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="font-semibold text-xs">JPG Image (.jpg)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Standard compressed image format.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Data Exports */}
        {activeTab === "data" && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Export raw task data for spreadsheets, databases, or local backup.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer"
              >
                <FileCode className="h-5 w-5 text-purple-600" />
                <div className="font-semibold text-xs">JSON Backup (.json)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Full hierarchical structure for importing or restoring later.
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="p-3.5 border rounded-lg hover:border-primary/60 hover:bg-muted/40 transition-all text-left space-y-1.5 cursor-pointer"
              >
                <Table className="h-5 w-5 text-emerald-600" />
                <div className="font-semibold text-xs">CSV Spreadsheet (.csv)</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Flat row-by-row task export compatible with Excel and Google Sheets.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Import JSON */}
        {activeTab === "import" && (
          <div className="space-y-3 py-4 text-center">
            <div className="border-2 border-dashed rounded-lg p-6 space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-xs font-semibold">Select a TaskForm JSON File</div>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Restore a previously exported JSON backup into a new workspace.
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="block mx-auto text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:cursor-pointer mt-2"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
