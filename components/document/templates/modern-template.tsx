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
    bar: "bg-neutral-900",
    pill: "bg-neutral-100 text-neutral-800 border-neutral-300",
    header: "text-neutral-900",
    border: "border-neutral-200",
    cardTop: "border-t-2 border-t-neutral-800",
    badge: "bg-neutral-100 text-neutral-700",
    progress: "bg-neutral-900",
  },
  indigo: {
    bar: "bg-indigo-600",
    pill: "bg-indigo-50 text-indigo-800 border-indigo-200",
    header: "text-indigo-950",
    border: "border-indigo-100",
    cardTop: "border-t-2 border-t-indigo-600",
    badge: "bg-indigo-50 text-indigo-700",
    progress: "bg-indigo-600",
  },
  slate: {
    bar: "bg-slate-700",
    pill: "bg-slate-100 text-slate-800 border-slate-300",
    header: "text-slate-900",
    border: "border-slate-200",
    cardTop: "border-t-2 border-t-slate-700",
    badge: "bg-slate-100 text-slate-700",
    progress: "bg-slate-700",
  },
  emerald: {
    bar: "bg-emerald-600",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    header: "text-emerald-950",
    border: "border-emerald-100",
    cardTop: "border-t-2 border-t-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    progress: "bg-emerald-600",
  },
  amber: {
    bar: "bg-amber-600",
    pill: "bg-amber-50 text-amber-900 border-amber-200",
    header: "text-amber-950",
    border: "border-amber-100",
    cardTop: "border-t-2 border-t-amber-600",
    badge: "bg-amber-50 text-amber-800",
    progress: "bg-amber-600",
  },
  category: {
    bar: "bg-primary",
    pill: "bg-muted text-foreground border-border",
    header: "text-foreground",
    border: "border-border",
    cardTop: "border-t-2 border-t-primary",
    badge: "bg-muted text-muted-foreground",
    progress: "bg-primary",
  },
};

export function ModernTemplate({ workspace, settings }: TemplateProps) {
  const accent = THEME_ACCENTS[settings.themeColor] || THEME_ACCENTS.monochrome;

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // Filter categories and tasks
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
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const pending = total - completed;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const isTwoColumn = settings.columnsLayout === "two_column";

  return (
    <div
      className={cn(
        "text-neutral-900 text-[10.5pt] print:text-[9pt] leading-normal print:leading-tight space-y-5 print:space-y-2.5",
        fontClass
      )}
    >
      {/* Top Accent Stripe */}
      <div className={cn("h-1.5 w-full rounded-full", accent.bar)} />

      {/* Modern Letterhead Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 print:pb-2">
        {/* Left: Branding & Logo */}
        <div className="flex items-center gap-3.5">
          {settings.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="max-h-12 max-w-[130px] print:max-h-9 print:max-w-[100px] object-contain rounded"
            />
          )}
          <div>
            {settings.organizationName && (
              <div className="text-xs print:text-[8pt] font-bold uppercase tracking-wider text-neutral-500">
                {settings.organizationName}
              </div>
            )}
            <h1 className={cn("text-xl print:text-base font-extrabold tracking-tight", accent.header)}>
              {settings.customTitle || "TASK MANAGEMENT REPORT"}
            </h1>
            {settings.headerSubtitle && (
              <p className="text-xs print:text-[7.5pt] text-neutral-500 font-medium">
                {settings.headerSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Workspace & Meta */}
        <div className="text-xs print:text-[8pt] text-neutral-500 sm:text-right space-y-0.5 shrink-0">
          {!settings.hideWorkspace && (
            <div>
              <span className="font-semibold text-neutral-700">Workspace:</span> {workspace.name}
            </div>
          )}
          <div>
            <span className="font-semibold text-neutral-700">Date:</span> {formatDate(new Date())}
          </div>
          {(settings.customPeriod || (settings.formPeriod && settings.formPeriod !== "weekly")) && (
            <div>
              <span className="font-semibold text-neutral-700">Period:</span>{" "}
              {settings.formPeriod === "custom"
                ? settings.customPeriod || "Custom"
                : settings.customPeriod
                ? `${settings.formPeriod.toUpperCase()} (${settings.customPeriod})`
                : settings.formPeriod.toUpperCase()}
            </div>
          )}
          {settings.formName && (
            <div>
              <span className="font-semibold text-neutral-700">Prepared by:</span> {settings.formName}
            </div>
          )}
        </div>
      </div>

      {/* Modern Executive Summary Card */}
      {settings.includeSummary && (
        <div className="rounded-lg bg-neutral-50/80 border border-neutral-200/80 p-3.5 print:p-2 print-break-inside-avoid space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs print:text-[8pt] font-bold uppercase tracking-wider text-neutral-600">
              Execution Progress
            </span>
            <span className="text-xs print:text-[8pt] font-mono font-bold text-neutral-800">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", accent.progress)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs print:text-[8pt]">
            <div>
              <div className="text-[10px] print:text-[7pt] text-neutral-500 uppercase">Total</div>
              <div className="font-bold text-sm print:text-xs">{total}</div>
            </div>
            <div>
              <div className="text-[10px] print:text-[7pt] text-neutral-500 uppercase">In Progress</div>
              <div className="font-bold text-sm print:text-xs text-blue-600 print:text-black">{inProgress}</div>
            </div>
            <div>
              <div className="text-[10px] print:text-[7pt] text-neutral-500 uppercase">Completed</div>
              <div className="font-bold text-sm print:text-xs text-emerald-600 print:text-black">{completed}</div>
            </div>
            <div>
              <div className="text-[10px] print:text-[7pt] text-neutral-500 uppercase">Pending</div>
              <div className="font-bold text-sm print:text-xs text-amber-600 print:text-black">{pending}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Categories Section */}
      <div className={cn(isTwoColumn ? "grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4" : "space-y-4 print:space-y-2")}>
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className={cn(
              "rounded-lg border p-3 print:p-1.5 print-break-inside-avoid space-y-2.5 bg-white shadow-2xs print:shadow-none",
              accent.border,
              settings.themeColor === "category" ? "" : accent.cardTop
            )}
            style={
              settings.themeColor === "category" && category.color
                ? { borderTopWidth: 2, borderTopColor: category.color }
                : undefined
            }
          >
            {/* Category Banner */}
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 print:border print:border-black"
                  style={{ backgroundColor: category.color || "#3b82f6" }}
                />
                <h3 className="font-bold text-xs print:text-[8.5pt] uppercase tracking-wider text-neutral-800">
                  {category.name}
                </h3>
              </div>
              <span className="text-[10px] print:text-[7pt] font-mono text-neutral-400">
                {category.subcategories.flatMap((s) => s.tasks).length} tasks
              </span>
            </div>

            {/* Subcategories & Tasks */}
            <div className="space-y-2.5">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="text-[11px] print:text-[7.5pt] font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="text-neutral-300 print:text-black">↳</span>
                    <span>{sub.name}</span>
                  </div>

                  <div className="space-y-1.5 pl-3 border-l border-neutral-200/80 print:border-neutral-400">
                    {sub.tasks.map((task) => {
                      const isTaskCompleted = task.status === "completed";
                      return (
                        <div key={task.id} className="text-xs print:text-[8pt] space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="inline-block w-3.5 h-3.5 rounded border border-neutral-400 mt-0.5 text-center text-[10px] leading-3 font-bold shrink-0 print:border-black">
                                {isTaskCompleted ? "✓" : ""}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "font-medium text-neutral-800",
                                    isTaskCompleted && "line-through text-neutral-400"
                                  )}
                                >
                                  {task.title}
                                </span>
                                {task.description && (
                                  <p className="text-[10.5px] print:text-[7pt] text-neutral-500 mt-0.5 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-1.5 text-[9.5px] print:text-[7pt] shrink-0">
                              {settings.includePriority && task.priority !== "low" && (
                                <span
                                  className={cn(
                                    "px-1.5 py-0.2 rounded font-medium",
                                    task.priority === "urgent"
                                      ? "bg-rose-50 text-rose-700 print:border print:border-black"
                                      : task.priority === "high"
                                      ? "bg-amber-50 text-amber-700 print:border print:border-black"
                                      : "bg-neutral-100 text-neutral-600"
                                  )}
                                >
                                  {task.priority}
                                </span>
                              )}
                              {settings.includeDueDates && task.due_date && (
                                <span className="font-mono text-neutral-500">
                                  {formatDate(task.due_date)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notes */}
                          {settings.includeNotes && task.notes && (
                            <div className="ml-5 p-1 bg-neutral-50 rounded text-[10px] text-neutral-600 italic border-l-2 border-neutral-300">
                              {task.notes}
                            </div>
                          )}

                          {/* Subtasks */}
                          {settings.includeSubtasks && task.subtasks && task.subtasks.length > 0 && (
                            <div className="ml-5 space-y-0.5 pt-0.5">
                              {task.subtasks.map((st) => (
                                <div key={st.id} className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                                  <span className="w-2.5 h-2.5 rounded-xs border border-neutral-300 text-center text-[7px] leading-2 inline-block">
                                    {st.status === "completed" ? "✓" : ""}
                                  </span>
                                  <span className={st.status === "completed" ? "line-through text-neutral-400" : ""}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Empty fill-in lines */}
                    {Array.from({ length: settings.emptyRowsCount }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-2 text-xs opacity-40">
                        <span className="inline-block w-3.5 h-3.5 border border-neutral-300 rounded" />
                        <span className="inline-block border-b border-neutral-300 flex-1 h-3" />
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
        <div className="rounded-lg border border-neutral-200 p-3 print:p-2 space-y-1.5 print-break-inside-avoid">
          <div className="text-xs print:text-[8pt] font-bold uppercase tracking-wider text-neutral-600">
            Notes & Next Actions
          </div>
          <div className="border-b border-neutral-200 h-4" />
          <div className="border-b border-neutral-200 h-4" />
        </div>
      )}

      {/* Sign-off / Signature Section */}
      {settings.includeSignature && (
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 pt-3 border-t border-neutral-200 text-xs print:text-[8pt] print-break-inside-avoid">
          <div>
            <span className="font-semibold block mb-2 text-neutral-700">Approved by:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
          <div>
            <span className="font-semibold block mb-2 text-neutral-700">Date:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
          <div>
            <span className="font-semibold block mb-2 text-neutral-700">Signature:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
        </div>
      )}
    </div>
  );
}
