"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { ProfessionalTemplate } from "@/components/document/templates/professional-template";
import { SimpleTemplate } from "@/components/document/templates/simple-template";
import { CompactTemplate } from "@/components/document/templates/compact-template";

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

  return (
    <div
      id={id}
      className={`w-full bg-white text-black transition-all ${marginClasses} ${className}`}
    >
      {settings.template === "professional" && (
        <ProfessionalTemplate workspace={workspace} settings={settings} />
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
