"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { formatDate, cn } from "@/lib/utils";

interface TemplateProps {
  workspace: WorkspaceWithDetails;
  settings: DocumentSettings;
}

const THEME_ACCENTS = {
  monochrome: {
    headerBorder: "border-black",
    cardBorder: "border-neutral-300",
    catBorder: "border-neutral-300",
    catText: "text-neutral-800",
  },
  indigo: {
    headerBorder: "border-indigo-600",
    cardBorder: "border-indigo-200",
    catBorder: "border-indigo-300",
    catText: "text-indigo-900",
  },
  slate: {
    headerBorder: "border-slate-700",
    cardBorder: "border-slate-300",
    catBorder: "border-slate-300",
    catText: "text-slate-900",
  },
  emerald: {
    headerBorder: "border-emerald-600",
    cardBorder: "border-emerald-200",
    catBorder: "border-emerald-300",
    catText: "text-emerald-900",
  },
  amber: {
    headerBorder: "border-amber-600",
    cardBorder: "border-amber-200",
    catBorder: "border-amber-300",
    catText: "text-amber-900",
  },
  category: {
    headerBorder: "border-primary",
    cardBorder: "border-neutral-200",
    catBorder: "border-neutral-300",
    catText: "text-neutral-900",
  },
};

export function CompactTemplate({ workspace, settings }: TemplateProps) {
  const accent = THEME_ACCENTS[settings.themeColor] || THEME_ACCENTS.monochrome;

  const filteredCategories = workspace.categories
    .map((cat) => ({
      ...cat,
      subcategories: cat.subcategories
        .map((sub) => ({
          ...sub,
          tasks: sub.tasks.filter((t) =>
            settings.includeCompleted ? true : t.status !== "completed"
          ),
        }))
        .filter((sub) => sub.tasks.length > 0),
    }))
    .filter((cat) => cat.subcategories.length > 0);

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div
      className={cn(
        "text-black text-[9pt] leading-tight space-y-3",
        fontClass
      )}
    >
      {/* Compact Header */}
      <div className={cn("flex flex-col sm:flex-row print:flex-row sm:items-center justify-between border-b pb-1.5 gap-2", accent.headerBorder)}>
        <div className="flex items-center gap-2">
          {settings.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="max-h-7 max-w-[80px] object-contain"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              {settings.organizationName && (
                <span className="font-semibold text-[10px] uppercase text-neutral-600">
                  {settings.organizationName} •
                </span>
              )}
              <span className="font-bold uppercase tracking-wider text-xs">
                {settings.customTitle || workspace.name}
              </span>
              <span className="text-[9px] text-neutral-500">
                ({!settings.hideWorkspace ? `${workspace.name} • ` : ""}{formatDate(new Date())}{settings.customPeriod ? ` • ${settings.customPeriod}` : settings.formPeriod && settings.formPeriod !== "weekly" ? ` • ${settings.formPeriod.toUpperCase()}` : ""})
              </span>
            </div>
            {settings.headerSubtitle && (
              <div className="text-[9px] text-neutral-500">
                {settings.headerSubtitle}
              </div>
            )}
          </div>
        </div>
        <div className="text-[9px] text-neutral-600 flex items-center gap-3 shrink-0">
          <span>Name: _____________</span>
          <span>Date: _____________</span>
        </div>
      </div>

      {/* Multi-column Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className={cn(
              "border rounded p-2 space-y-2 print-break-inside-avoid bg-neutral-50/50",
              accent.cardBorder
            )}
          >
            <div
              className={cn(
                "font-bold text-[10pt] uppercase border-b pb-0.5 flex justify-between items-center",
                accent.catBorder,
                accent.catText
              )}
              style={
                settings.themeColor === "category" && category.color
                  ? { color: category.color, borderColor: category.color }
                  : undefined
              }
            >
              <span>{category.name}</span>
              <span className="text-[8pt] font-normal text-neutral-500">
                {category.subcategories.flatMap((s) => s.tasks).length} items
              </span>
            </div>

            <div className="space-y-2">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="font-semibold text-[8.5pt] text-neutral-600">
                    • {sub.name}
                  </div>

                  <div className="space-y-1 pl-2">
                    {sub.tasks.map((task) => {
                      const isCompleted = task.status === "completed";
                      return (
                        <div key={task.id} className="space-y-0.5">
                          <div className="flex items-center justify-between gap-1 text-[8.5pt]">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span className="inline-block w-3 h-3 border border-black text-center text-[8px] leading-2.5 shrink-0">
                                {isCompleted ? "✓" : ""}
                              </span>
                              <span
                                className={`truncate ${
                                  isCompleted ? "line-through text-neutral-400" : ""
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>
                            {settings.includeDueDates && task.due_date && (
                              <span className="text-[7.5pt] text-neutral-500 shrink-0 font-mono">
                                {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>

                          {/* Subtasks compact list */}
                          {settings.includeSubtasks &&
                            task.subtasks &&
                            task.subtasks.length > 0 && (
                              <div className="pl-4 space-y-0.5">
                                {task.subtasks.map((st) => (
                                  <div
                                    key={st.id}
                                    className="flex items-center gap-1 text-[7.5pt] text-neutral-600"
                                  >
                                    <span className="inline-block w-2.5 h-2.5 border border-black text-center text-[7px] leading-2 shrink-0">
                                      {st.status === "completed" ? "✓" : ""}
                                    </span>
                                    <span
                                      className={
                                        st.status === "completed"
                                          ? "line-through text-neutral-400"
                                          : ""
                                      }
                                    >
                                      {st.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
