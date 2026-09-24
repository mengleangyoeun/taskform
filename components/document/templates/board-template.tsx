"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings, formatPeriodDisplay } from "@/types/document";
import { formatDate, cn } from "@/lib/utils";

interface TemplateProps {
  workspace: WorkspaceWithDetails;
  settings: DocumentSettings;
}

const THEME_ACCENTS = {
  monochrome: {
    headerBorder: "border-neutral-800",
    cardBorder: "border-neutral-300",
    header: "text-neutral-900",
    columnHeader: "bg-neutral-100 text-neutral-800 border-neutral-300",
    columnBg: "bg-neutral-50/50",
    badge: "bg-white text-neutral-800 border-neutral-300",
  },
  indigo: {
    headerBorder: "border-indigo-600",
    cardBorder: "border-indigo-200",
    header: "text-indigo-950",
    columnHeader: "bg-indigo-100/70 text-indigo-900 border-indigo-200",
    columnBg: "bg-indigo-50/30",
    badge: "bg-white text-indigo-800 border-indigo-200",
  },
  slate: {
    headerBorder: "border-slate-700",
    cardBorder: "border-slate-300",
    header: "text-slate-900",
    columnHeader: "bg-slate-100 text-slate-800 border-slate-300",
    columnBg: "bg-slate-50/50",
    badge: "bg-white text-slate-800 border-slate-300",
  },
  emerald: {
    headerBorder: "border-emerald-600",
    cardBorder: "border-emerald-200",
    header: "text-emerald-950",
    columnHeader: "bg-emerald-100/70 text-emerald-900 border-emerald-200",
    columnBg: "bg-emerald-50/30",
    badge: "bg-white text-emerald-800 border-emerald-200",
  },
  amber: {
    headerBorder: "border-amber-600",
    cardBorder: "border-amber-200",
    header: "text-amber-950",
    columnHeader: "bg-amber-100/70 text-amber-900 border-amber-200",
    columnBg: "bg-amber-50/30",
    badge: "bg-white text-amber-900 border-amber-200",
  },
  category: {
    headerBorder: "border-primary",
    cardBorder: "border-border",
    header: "text-foreground",
    columnHeader: "bg-muted text-foreground border-border",
    columnBg: "bg-muted/20",
    badge: "bg-background text-foreground border-border",
  },
};

const COLUMNS = [
  { id: "not_started", label: "To Do", color: "border-neutral-400 bg-neutral-50/50" },
  { id: "in_progress", label: "In Progress", color: "border-blue-400 bg-blue-50/30" },
  { id: "waiting", label: "Waiting", color: "border-amber-400 bg-amber-50/30" },
  { id: "completed", label: "Completed", color: "border-emerald-400 bg-emerald-50/30" },
] as const;

export function BoardTemplate({ workspace, settings }: TemplateProps) {
  const accent = THEME_ACCENTS[settings.themeColor] || THEME_ACCENTS.monochrome;

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // Flatten and group tasks by status
  type FlattenedTask = {
    id: string;
    title: string;
    description: string | null;
    categoryName: string;
    categoryColor: string | null;
    subcategoryName: string;
    priority: string;
    status: string;
    dueDate: string | null;
    notes: string | null;
    subtasks: { id: string; title: string; status: string }[];
  };

  const tasksByStatus: Record<string, FlattenedTask[]> = {
    not_started: [],
    in_progress: [],
    waiting: [],
    completed: [],
  };

  workspace.categories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.tasks.forEach((t) => {
        if (!settings.includeCompleted && t.status === "completed") return;
        const targetStatus = t.status in tasksByStatus ? t.status : "not_started";
        tasksByStatus[targetStatus].push({
          id: t.id,
          title: t.title,
          description: t.description,
          categoryName: cat.name,
          categoryColor: cat.color,
          subcategoryName: sub.name,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          notes: t.notes,
          subtasks: t.subtasks || [],
        });
      });
    });
  });

  const totalTasks = Object.values(tasksByStatus).reduce((acc, curr) => acc + curr.length, 0);

  const visibleColumns = settings.includeCompleted
    ? COLUMNS
    : COLUMNS.filter((c) => c.id !== "completed");

  return (
    <div
      className={cn(
        "text-neutral-900 text-[10pt] print:text-[8pt] leading-tight space-y-4 print:space-y-2",
        fontClass
      )}
    >
      {/* Board Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 print:pb-1.5",
          accent.headerBorder
        )}
      >
        <div className="flex items-center gap-3">
          {settings.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="max-h-10 max-w-[120px] print:max-h-8 print:max-w-[90px] object-contain rounded"
            />
          )}
          <div>
            {settings.organizationName && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                {settings.organizationName}
              </div>
            )}
            <h1 className={cn("text-lg print:text-base font-extrabold tracking-tight uppercase", accent.header)}>
              {settings.customTitle || "TASK KANBAN BOARD"}
            </h1>
            {settings.headerSubtitle && (
              <p className="text-xs print:text-[7.5pt] text-neutral-500">{settings.headerSubtitle}</p>
            )}
          </div>
        </div>

        <div className="text-xs print:text-[7.5pt] text-neutral-600 sm:text-right space-y-0.5 shrink-0">
          {!settings.hideWorkspace && (
            <div>
              <span className="font-semibold text-neutral-800">Workspace:</span> {workspace.name}
            </div>
          )}
          <div>
            <span className="font-semibold text-neutral-800">Date:</span> {formatDate(new Date())}
          </div>
          {(settings.customPeriod || settings.periodStartDate || settings.periodEndDate || (settings.formPeriod && settings.formPeriod !== "weekly")) && (
            <div>
              <span className="font-semibold text-neutral-800">Period:</span>{" "}
              {formatPeriodDisplay(settings)}
            </div>
          )}
          <div>
            <span className="font-semibold text-neutral-800">Tasks:</span> {totalTasks} total
          </div>
        </div>
      </div>

      {/* Board Summary Bar */}
      {settings.includeSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs print:text-[7.5pt] print-break-inside-avoid">
          {visibleColumns.map((col) => (
            <div
              key={`metric-${col.id}`}
              className={cn(
                "p-2 rounded border shadow-2xs print:shadow-none",
                accent.cardBorder,
                accent.columnBg
              )}
            >
              <div className="text-[9px] print:text-[7pt] uppercase font-bold text-neutral-500">
                {col.label}
              </div>
              <div className="text-base print:text-xs font-bold text-neutral-900">
                {tasksByStatus[col.id]?.length || 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3 or 4 Column Printable Matrix */}
      <div
        className={cn(
          "grid gap-3 print:gap-2",
          visibleColumns.length === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3 print:grid-cols-3"
        )}
      >
        {visibleColumns.map((column) => {
          const colTasks = tasksByStatus[column.id] || [];
          return (
            <div
              key={column.id}
              className={cn(
                "flex flex-col rounded-lg border p-2 print:p-1.5 min-h-[140px] space-y-2 print:space-y-1.5 shadow-2xs print:shadow-none",
                accent.cardBorder,
                accent.columnBg
              )}
            >
              {/* Column Header */}
              <div
                className={cn(
                  "flex items-center justify-between pb-1.5 px-1 py-0.5 rounded",
                  accent.columnHeader
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs print:text-[8pt] uppercase tracking-wide">
                    {column.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] print:text-[7pt] font-mono px-1.5 py-0.2 print:border print:border-black border rounded-full font-bold",
                    accent.badge
                  )}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 print:space-y-1.5 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 print:p-1 rounded bg-white border border-neutral-200 print:border-black shadow-2xs print:shadow-none print-break-inside-avoid space-y-1 text-xs print:text-[7.5pt]"
                  >
                    {/* Header: Category Badge + Priority */}
                    <div className="flex items-center justify-between gap-1 text-[9px] print:text-[6.5pt]">
                      <span className="inline-flex items-center gap-1 font-semibold text-neutral-600 truncate max-w-[110px]">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 print:border print:border-black"
                          style={{ backgroundColor: task.categoryColor || "#3b82f6" }}
                        />
                        <span className="truncate">{task.categoryName}</span>
                      </span>
                      {settings.includePriority && task.priority !== "low" && (
                        <span
                          className={cn(
                            "px-1 py-0.2 rounded font-semibold uppercase text-[8px] print:text-[6pt] shrink-0",
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
                    </div>

                    {/* Task Title */}
                    <div className="font-medium text-neutral-900 leading-snug">
                      <span
                        className={cn(
                          task.status === "completed" && "line-through text-neutral-400"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-[10px] print:text-[7pt] text-neutral-500 line-clamp-2 leading-tight">
                        {task.description}
                      </p>
                    )}

                    {/* Notes */}
                    {settings.includeNotes && task.notes && (
                      <div className="text-[9px] print:text-[6.5pt] text-neutral-600 italic border-l-2 border-neutral-300 pl-1 py-0.2 bg-neutral-50">
                        {task.notes}
                      </div>
                    )}

                    {/* Footer: Due date + Subtasks */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 print:border-neutral-300 text-[9px] print:text-[6.5pt] text-neutral-500">
                      {settings.includeDueDates && task.dueDate ? (
                        <span className="font-mono">{formatDate(task.dueDate)}</span>
                      ) : (
                        <span />
                      )}
                      {settings.includeSubtasks && task.subtasks.length > 0 && (
                        <span className="font-mono">
                          {task.subtasks.filter((s) => s.status === "completed").length}/
                          {task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty fill-in cards if configured on 'not_started' */}
                {column.id === "not_started" &&
                  Array.from({ length: settings.emptyRowsCount }).map((_, i) => (
                    <div
                      key={`empty-board-card-${i}`}
                      className="p-2 rounded border border-dashed border-neutral-300 print:border-neutral-400 bg-white/60 space-y-1.5 opacity-60"
                    >
                      <div className="h-2 w-1/3 bg-neutral-200 rounded" />
                      <div className="h-3 w-4/5 border-b border-neutral-200" />
                    </div>
                  ))}

                {colTasks.length === 0 && column.id !== "not_started" && (
                  <div className="text-center py-4 text-[10px] print:text-[7pt] text-neutral-400 italic">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Freeform Notes Section */}
      {settings.includeNotes && (
        <div className="rounded border border-neutral-200 p-2.5 print:p-1.5 space-y-1 print-break-inside-avoid">
          <div className="text-[10px] print:text-[7.5pt] font-bold uppercase tracking-wider text-neutral-600">
            Sprint & Delivery Notes
          </div>
          <div className="border-b border-neutral-200 h-3" />
        </div>
      )}

      {/* Sign-off / Signature Section */}
      {settings.includeSignature && (
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 pt-3 border-t border-neutral-200 text-xs print:text-[7.5pt] print-break-inside-avoid">
          <div>
            <span className="font-semibold block mb-1 text-neutral-700">Team Lead:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
          <div>
            <span className="font-semibold block mb-1 text-neutral-700">Review Date:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
          <div>
            <span className="font-semibold block mb-1 text-neutral-700">Sign-off:</span>
            <div className="border-b border-neutral-400 h-3" />
          </div>
        </div>
      )}
    </div>
  );
}
