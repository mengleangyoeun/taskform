"use client";

import { useState } from "react";
import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings, defaultDocumentSettings } from "@/types/document";
import { DocumentSettingsPanel } from "@/components/document/document-settings-panel";
import { DocumentRenderer } from "@/components/document/document-renderer";
import { Button } from "@/components/ui/button";
import { Printer, Eye, ZoomIn, ZoomOut, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewProps {
  workspace: WorkspaceWithDetails | null;
  settings?: DocumentSettings;
  onSettingsChange?: (settings: DocumentSettings) => void;
}

export function DocumentView({
  workspace,
  settings: externalSettings,
  onSettingsChange: externalOnChange,
}: DocumentViewProps) {
  const [internalSettings, setInternalSettings] = useState<DocumentSettings>(defaultDocumentSettings);
  const settings = externalSettings ?? internalSettings;
  const setSettings = externalOnChange ?? setInternalSettings;

  // Responsive mobile mode: preview vs settings tab
  const [mobileTab, setMobileTab] = useState<"preview" | "settings">("preview");
  const [zoom, setZoom] = useState<number>(100);

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 15, 150));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 15, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  if (!workspace) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card p-6 no-print">
        <p className="text-sm text-muted-foreground">
          Please select or create a workspace to view its printable document.
        </p>
      </div>
    );
  }

  // Paper dimensions style for desktop preview
  const paperStyle =
    settings.orientation === "landscape"
      ? { minHeight: "210mm", width: "100%", maxWidth: "297mm" }
      : { minHeight: "297mm", width: "100%", maxWidth: "210mm" };

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* Mobile-only Segmented Navigation: Switch between Preview and Settings on small screens */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-muted/40 rounded-lg border border-border/40 w-full no-print">
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md text-center transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("settings")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md text-center transition-all cursor-pointer ${
            mobileTab === "settings"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Setup & Branding</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:block print:w-full print:m-0 print:p-0">
        {/* Settings Sidebar (Shown on desktop, or when mobileTab is 'settings' on mobile) */}
        <div
          className={cn(
            "lg:col-span-4 no-print space-y-3",
            mobileTab !== "settings" && "hidden lg:block"
          )}
        >
          <DocumentSettingsPanel
            settings={settings}
            onChange={setSettings}
            onPrint={handlePrint}
          />
        </div>

        {/* Live Document Preview Sheet Area (Shown on desktop, or when mobileTab is 'preview' on mobile) */}
        <div
          className={cn(
            "lg:col-span-8 flex flex-col items-center print:block print:w-full print:m-0 print:p-0 min-w-0",
            mobileTab !== "preview" && "hidden lg:flex"
          )}
        >
          {/* Preview Control Toolbar */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-border/40 no-print text-xs text-muted-foreground flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>
                {settings.paperSize.toUpperCase()} • {settings.orientation}
              </span>
            </div>

            {/* Zoom & Quick Print Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="inline-flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-md border border-border/40">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleZoomOut}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="h-6 px-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  title="Reset Zoom (100%)"
                >
                  <span>{zoom}%</span>
                  {zoom !== 100 && <RotateCcw className="h-2.5 w-2.5 opacity-60" />}
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleZoomIn}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              <Button
                size="xs"
                variant="outline"
                onClick={handlePrint}
                className="h-7 text-[11px] px-2.5 gap-1.5 rounded-md font-medium"
              >
                <Printer className="h-3 w-3" />
                <span>Print</span>
              </Button>
            </div>
          </div>

          {/* Physical Sheet Artboard Canvas (Scrollable horizontally on mobile without breaking viewport) */}
          <div className="w-full overflow-x-auto p-2 sm:p-5 bg-muted/20 dark:bg-muted/10 rounded-xl border border-border/40 flex justify-center items-start print:bg-white print:border-0 print:p-0 print:m-0 print:overflow-visible min-h-[500px]">
            <div
              style={{
                ...paperStyle,
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                transformOrigin: "top center",
              }}
              className="w-full min-w-[560px] sm:min-w-0 bg-white text-black shadow-md rounded-md border border-neutral-200 transition-all shrink-0 print:border-0 print:shadow-none print:m-0 print:p-0 print:max-w-none print:!min-h-0 print:!h-auto print:w-full print:!transform-none print:min-w-0"
            >
              <DocumentRenderer workspace={workspace} settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
