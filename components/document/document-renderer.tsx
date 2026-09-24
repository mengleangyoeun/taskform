"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { ProfessionalTemplate } from "@/components/document/templates/professional-template";
import { ModernTemplate } from "@/components/document/templates/modern-template";
import { TabularTemplate } from "@/components/document/templates/tabular-template";
import { BoardTemplate } from "@/components/document/templates/board-template";
import { SimpleTemplate } from "@/components/document/templates/simple-template";
import { CompactTemplate } from "@/components/document/templates/compact-template";
import { cn } from "@/lib/utils";

interface DocumentRendererProps {
  workspace: WorkspaceWithDetails;
  settings: DocumentSettings;
  className?: string;
  id?: string;
}

export function DocumentRenderer({
  workspace,
  settings,
  className = "",
  id = "printable-document-sheet",
}: DocumentRendererProps) {
  const marginClasses = {
    compact: "p-3 sm:p-5 print:p-0",
    normal: "p-4 sm:p-8 print:p-0",
    wide: "p-6 sm:p-12 print:p-0",
  }[settings.margin];

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div
      id={id}
      className={cn(
        "w-full bg-white text-black transition-all",
        marginClasses,
        fontClass,
        className
      )}
    >
      {settings.template === "professional" && (
        <ProfessionalTemplate workspace={workspace} settings={settings} />
      )}
      {settings.template === "modern" && (
        <ModernTemplate workspace={workspace} settings={settings} />
      )}
      {settings.template === "tabular" && (
        <TabularTemplate workspace={workspace} settings={settings} />
      )}
      {settings.template === "board" && (
        <BoardTemplate workspace={workspace} settings={settings} />
      )}
      {settings.template === "simple" && (
        <SimpleTemplate workspace={workspace} settings={settings} />
      )}
      {settings.template === "compact" && (
        <CompactTemplate workspace={workspace} settings={settings} />
      )}
    </div>
  );
}
