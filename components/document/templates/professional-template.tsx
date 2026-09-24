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
    summaryBorder: "border-black",
    summaryBg: "bg-neutral-50 print:bg-transparent",
    summaryTitleBorder: "border-black",
    categoryHeaderBg: "bg-neutral-800",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-black",
  },
  indigo: {
    headerBorder: "border-indigo-600",
    summaryBorder: "border-indigo-300",
    summaryBg: "bg-indigo-50/70 print:bg-transparent",
    summaryTitleBorder: "border-indigo-300",
    categoryHeaderBg: "bg-indigo-700",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-indigo-900",
  },
  slate: {
    headerBorder: "border-slate-700",
    summaryBorder: "border-slate-400",
    summaryBg: "bg-slate-100/70 print:bg-transparent",
    summaryTitleBorder: "border-slate-300",
    categoryHeaderBg: "bg-slate-700",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-slate-900",
  },
  emerald: {
    headerBorder: "border-emerald-600",
    summaryBorder: "border-emerald-300",
    summaryBg: "bg-emerald-50/70 print:bg-transparent",
    summaryTitleBorder: "border-emerald-300",
    categoryHeaderBg: "bg-emerald-700",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-emerald-900",
  },
  amber: {
    headerBorder: "border-amber-600",
    summaryBorder: "border-amber-300",
    summaryBg: "bg-amber-50/70 print:bg-transparent",
    summaryTitleBorder: "border-amber-300",
    categoryHeaderBg: "bg-amber-700",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-amber-900",
  },
  category: {
    headerBorder: "border-neutral-800",
    summaryBorder: "border-neutral-300",
    summaryBg: "bg-neutral-50 print:bg-transparent",
    summaryTitleBorder: "border-neutral-300",
    categoryHeaderBg: "bg-neutral-800",
    categoryHeaderText: "text-white",
    checkboxBorder: "border-black",
  },
};

export function ProfessionalTemplate({ workspace, settings }: TemplateProps) {
  const accent = THEME_ACCENTS[settings.themeColor] || THEME_ACCENTS.monochrome;

  // Filter categories and tasks based on settings
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
        .filter((sub) => sub.tasks.length > 0 || settings.emptyRowsCount > 0),
    }))
    .filter((cat) => cat.subcategories.length > 0);

  // Compute metrics
  const allTasks = filteredCategories.flatMap((c) =>
    c.subcategories.flatMap((s) => s.tasks)
  );
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <div
      className={cn(
        "text-black text-[11pt] print:text-[9.5pt] leading-normal print:leading-tight space-y-6 print:space-y-3",
        fontClass
      )}
    >
      {/* Form Header */}
      <div className={cn("border-b-2 pb-3 print:pb-1.5 print:border-black", accent.headerBorder)}>
        <div className="flex flex-col sm:flex-row print:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Logo or Organization on the left */}
          {settings.logoUrl ? (
            <div className="shrink-0 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt="Organization Logo"
                className="max-h-12 max-w-[130px] print:max-h-9 print:max-w-[100px] object-contain"
              />
              {settings.organizationName && (
                <div className="text-left">
                  <div className="font-bold text-sm print:text-xs uppercase tracking-wide">
                    {settings.organizationName}
                  </div>
                  {settings.headerSubtitle && (
                    <div className="text-[10px] print:text-[7.5pt] text-neutral-600 font-normal">
                      {settings.headerSubtitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : settings.organizationName ? (
            <div className="text-left shrink-0">
              <div className="font-bold text-sm print:text-xs uppercase tracking-wider">
                {settings.organizationName}
              </div>
              {settings.headerSubtitle && (
                <div className="text-[10px] print:text-[7.5pt] text-neutral-600 font-normal">
                  {settings.headerSubtitle}
                </div>
              )}
            </div>
          ) : null}

          {/* Title and Workspace info */}
          <div
            className={cn(
              "flex-1",
              settings.logoUrl || settings.organizationName
                ? "text-left sm:text-right print:text-right"
                : "text-left sm:text-center print:text-center"
            )}
          >
            <h1 className="text-xl print:text-base font-bold tracking-wider uppercase mb-0.5">
              {settings.customTitle || "TASK MANAGEMENT FORM"}
            </h1>
            {!settings.logoUrl && !settings.organizationName && settings.headerSubtitle && (
              <div className="text-xs print:text-[8pt] text-neutral-600 font-medium mb-0.5">
                {settings.headerSubtitle}
              </div>
            )}
            <div className="text-xs print:text-[8pt] text-neutral-600 font-medium">
              Workspace: {workspace.name} • Generated: {formatDate(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Fillable Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-2 sm:gap-4 print:gap-2 text-xs print:text-[8pt] py-2 print:py-1 border-b border-black">
        <div className="flex items-center gap-1">
          <span className="font-semibold shrink-0">Name: </span>
          <span className="inline-block border-b border-black flex-1 max-w-[160px] print:max-w-none print:w-28">
            {settings.formName || "\u00A0"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold shrink-0">Date: </span>
          <span className="inline-block border-b border-black flex-1 max-w-[140px] print:max-w-none print:w-24">
            {formatDate(new Date())}
          </span>
        </div>
        <div className="flex items-center gap-3 print:gap-1.5 flex-wrap">
          <span className="font-semibold">Period:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 print:w-3 print:h-3 border border-black text-center text-[9px] print:text-[7pt] leading-3 print:leading-2.5">
              {settings.formPeriod === "daily" ? "✓" : ""}
            </span>
            <span>Daily</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 print:w-3 print:h-3 border border-black text-center text-[9px] print:text-[7pt] leading-3 print:leading-2.5">
              {settings.formPeriod === "weekly" ? "✓" : ""}
            </span>
            <span>Weekly</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3.5 h-3.5 print:w-3 print:h-3 border border-black text-center text-[9px] print:text-[7pt] leading-3 print:leading-2.5">
              {settings.formPeriod === "monthly" ? "✓" : ""}
            </span>
            <span>Monthly</span>
          </span>
        </div>
      </div>

      {/* Summary Box */}
      {settings.includeSummary && (
        <div
          className={cn(
            "border p-3 print:p-2 rounded-xs print-break-inside-avoid print:border-black print:bg-transparent shadow-2xs print:shadow-none",
            accent.summaryBorder,
            accent.summaryBg
          )}
        >
          <div
            className={cn(
              "text-xs print:text-[8pt] font-bold uppercase tracking-wider mb-2 print:mb-1 border-b pb-1 print:pb-0.5 print:border-black",
              accent.summaryTitleBorder
            )}
          >
            Summary Overview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 text-center text-xs print:text-[8pt]">
            <div>
              <div className="font-semibold text-neutral-600 print:text-[7.5pt]">Total Tasks</div>
              <div className="font-bold text-sm print:text-xs">{total}</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-600 print:text-[7.5pt]">Completed</div>
              <div className="font-bold text-sm print:text-xs">{completed}</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-600 print:text-[7.5pt]">Pending</div>
              <div className="font-bold text-sm print:text-xs">{pending}</div>
            </div>
            <div>
              <div className="font-semibold text-neutral-600 print:text-[7.5pt]">Progress</div>
              <div className="font-bold text-sm print:text-xs">{progressPercent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Tasks Hierarchy */}
      <div
        className={cn(
          settings.columnsLayout === "two_column"
            ? "grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4"
            : "space-y-6 print:space-y-2.5"
        )}
      >
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-3 print:space-y-1.5">
            {/* Category Header */}
            <div
              className={cn(
                "text-white font-bold text-xs print:text-[8pt] uppercase tracking-wider px-3 print:px-2 py-1.5 print:py-1 rounded-xs flex items-center justify-between print:bg-black print:text-white print-break-inside-avoid shadow-2xs print:shadow-none",
                settings.themeColor === "category" ? "" : accent.categoryHeaderBg
              )}
              style={
                settings.themeColor === "category"
                  ? { backgroundColor: category.color || "#1e293b" }
                  : undefined
              }
            >
              <span>CATEGORY: {category.name}</span>
              <span className="text-[10px] print:text-[7.5pt] font-normal opacity-90">
                {category.subcategories.flatMap((s) => s.tasks).length} Tasks
              </span>
            </div>

            {/* Subcategories */}
            <div className="space-y-3 print:space-y-1.5 pl-2 print:pl-1">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="space-y-2 print:space-y-1">
                  <div className="font-bold text-xs print:text-[8pt] uppercase tracking-wide text-neutral-700 border-b border-neutral-300 pb-1 print:pb-0.5 flex items-center justify-between print-break-inside-avoid">
                    <span>SUBCATEGORY: {sub.name}</span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2.5 print:space-y-1 pt-1 print:pt-0.5">
                    {sub.tasks.map((task) => {
                      const isTaskCompleted = task.status === "completed";
                      return (
                        <div
                          key={task.id}
                          className="pl-2 border-l-2 border-neutral-200 print-break-inside-avoid"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2 text-xs print:flex-row print:items-start">
                            <div className="flex items-start gap-2 flex-1">
                              {/* Printable Checkbox */}
                              <span className="inline-block w-3.5 h-3.5 border border-black mt-0.5 text-center text-[10px] leading-3 font-bold shrink-0">
                                {isTaskCompleted ? "✓" : ""}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span
                                  className={`font-semibold ${
                                    isTaskCompleted ? "line-through text-neutral-500" : ""
                                  }`}
                                >
                                  {task.title}
                                </span>
                                {task.description && (
                                  <p className="text-[10px] text-neutral-600 mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Task Metadata (Priority, Due Date, Status) */}
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] text-neutral-600 flex-wrap sm:shrink-0 pl-5.5 sm:pl-0">
                              {settings.includePriority && (
                                <span>
                                  Priority:{" "}
                                  <strong className="capitalize">{task.priority}</strong>
                                </span>
                              )}
                              {settings.includeDueDates && (
                                <span>
                                  Due:{" "}
                                  <strong>
                                    {task.due_date ? formatDate(task.due_date) : "__________"}
                                  </strong>
                                </span>
                              )}
                              {settings.includeStatus && (
                                <span>
                                  Status:{" "}
                                  <strong className="capitalize">
                                    {task.status.replace("_", " ")}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes if enabled */}
                          {settings.includeNotes && task.notes && (
                            <div className="ml-5 mt-1 text-[10px] text-neutral-600 italic border-l border-neutral-300 pl-2">
                              Notes: {task.notes}
                            </div>
                          )}

                          {/* Subtasks if enabled */}
                          {settings.includeSubtasks &&
                            task.subtasks &&
                            task.subtasks.length > 0 && (
                              <div className="ml-5 mt-1.5 space-y-1">
                                {task.subtasks.map((st) => (
                                  <div
                                    key={st.id}
                                    className="flex items-center gap-2 text-[10px] text-neutral-700"
                                  >
                                    <span className="inline-block w-3 h-3 border border-black text-center text-[8px] leading-2.5 shrink-0">
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

                    {/* Empty task fill-in lines if requested */}
                    {Array.from({ length: settings.emptyRowsCount }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-2 pl-2 text-xs">
                        <span className="inline-block w-3.5 h-3.5 border border-black shrink-0" />
                        <span className="inline-block border-b border-neutral-300 flex-1 h-4" />
                        <span className="text-[10px] text-neutral-400">Due: __________</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Freeform Notes Section */}
      {settings.includeNotes && (
        <div className="border border-black p-3 print:p-2 space-y-2 print:space-y-1 print-break-inside-avoid">
          <div className="text-xs print:text-[8pt] font-bold uppercase tracking-wider">Additional Notes</div>
          <div className="border-b border-neutral-300 h-4 print:h-3" />
          <div className="border-b border-neutral-300 h-4 print:h-3" />
        </div>
      )}

      {/* Sign-off / Signature Section */}
      {settings.includeSignature && (
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 sm:gap-6 print:gap-4 pt-4 print:pt-2 border-t border-black text-xs print:text-[8pt] print-break-inside-avoid">
          <div>
            <span className="font-semibold block mb-3 print:mb-1.5">Completed by:</span>
            <div className="border-b border-black h-3 print:h-2" />
          </div>
          <div>
            <span className="font-semibold block mb-3 print:mb-1.5">Date:</span>
            <div className="border-b border-black h-3 print:h-2" />
          </div>
          <div>
            <span className="font-semibold block mb-3 print:mb-1.5">Signature:</span>
            <div className="border-b border-black h-3 print:h-2" />
          </div>
        </div>
      )}
    </div>
  );
}
