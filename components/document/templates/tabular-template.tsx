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
    headerBorder: "border-neutral-800",
    thBg: "bg-neutral-800 text-white",
    tableBorder: "border-neutral-800",
    accentText: "text-neutral-900",
  },
  indigo: {
    headerBorder: "border-indigo-600",
    thBg: "bg-indigo-700 text-white",
    tableBorder: "border-indigo-600",
    accentText: "text-indigo-900",
  },
  slate: {
    headerBorder: "border-slate-700",
    thBg: "bg-slate-700 text-white",
    tableBorder: "border-slate-700",
    accentText: "text-slate-900",
  },
  emerald: {
    headerBorder: "border-emerald-600",
    thBg: "bg-emerald-700 text-white",
    tableBorder: "border-emerald-600",
    accentText: "text-emerald-900",
  },
  amber: {
    headerBorder: "border-amber-600",
    thBg: "bg-amber-700 text-white",
    tableBorder: "border-amber-600",
    accentText: "text-amber-900",
  },
  category: {
    headerBorder: "border-primary",
    thBg: "bg-primary text-primary-foreground",
    tableBorder: "border-primary",
    accentText: "text-primary",
  },
};

export function TabularTemplate({ workspace, settings }: TemplateProps) {
  const accent = THEME_ACCENTS[settings.themeColor] || THEME_ACCENTS.monochrome;

  const fontClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  // Flatten filtered tasks
  const tasksList: {
    id: string;
    title: string;
    description: string | null;
    categoryName: string;
    subcategoryName: string;
    priority: string;
    status: string;
    dueDate: string | null;
    isCompleted: boolean;
    notes: string | null;
    subtasksCount: number;
    completedSubtasksCount: number;
  }[] = [];

  workspace.categories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.tasks.forEach((t) => {
        if (!settings.includeCompleted && t.status === "completed") return;
        tasksList.push({
          id: t.id,
          title: t.title,
          description: t.description,
          categoryName: cat.name,
          subcategoryName: sub.name,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          isCompleted: t.status === "completed",
          notes: t.notes,
          subtasksCount: t.subtasks?.length || 0,
          completedSubtasksCount:
            t.subtasks?.filter((st) => st.status === "completed").length || 0,
        });
      });
    });
  });

  const total = tasksList.length;
  const completed = tasksList.filter((t) => t.isCompleted).length;

  return (
    <div
      className={cn(
        "text-neutral-900 text-[10pt] print:text-[8.5pt] leading-tight space-y-4 print:space-y-2",
        fontClass
      )}
    >
      {/* Tabular Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 gap-3",
          accent.headerBorder
        )}
      >
        <div className="flex items-center gap-3">
          {settings.logoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="max-h-10 max-w-[110px] object-contain"
            />
          )}
          <div>
            {settings.organizationName && (
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                {settings.organizationName}
              </div>
            )}
            <h1 className="text-lg print:text-base font-bold tracking-tight uppercase">
              {settings.customTitle || "TASK LOG & AUDIT SHEET"}
            </h1>
            {settings.headerSubtitle && (
              <p className="text-xs text-neutral-500">{settings.headerSubtitle}</p>
            )}
          </div>
        </div>

        <div className="text-xs text-neutral-600 sm:text-right space-y-0.5 shrink-0">
          <div>
            <strong>Workspace:</strong> {workspace.name}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(new Date())}
          </div>
          <div>
            <strong>Items:</strong> {total} ({completed} completed)
          </div>
        </div>
      </div>

      {/* Structured Ledger Table */}
      <div className="overflow-x-auto print:overflow-visible">
        <table
          className={cn(
            "w-full min-w-[580px] print:min-w-0 border-collapse border text-left text-[9.5pt] print:text-[8pt]",
            accent.tableBorder
          )}
        >
          <thead>
            <tr
              className={cn(
                "font-semibold text-[8.5pt] uppercase tracking-wider",
                accent.thBg
              )}
            >
              <th className="border border-neutral-800 p-1.5 w-8 text-center">#</th>
              <th className="border border-neutral-800 p-1.5 w-8 text-center">[✓]</th>
              <th className="border border-neutral-800 p-1.5 min-w-[180px]">Task & Description</th>
              <th className="border border-neutral-800 p-1.5 w-32">Category / Group</th>
              {settings.includePriority && (
                <th className="border border-neutral-800 p-1.5 w-20 text-center">Priority</th>
              )}
              {settings.includeDueDates && (
                <th className="border border-neutral-800 p-1.5 w-24 text-center">Due Date</th>
              )}
              {settings.includeStatus && (
                <th className="border border-neutral-800 p-1.5 w-24 text-center">Status</th>
              )}
              {settings.includeSignature && (
                <th className="border border-neutral-800 p-1.5 w-24 text-center">Sign-off</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasksList.map((task, idx) => (
              <tr
                key={task.id}
                className={cn(
                  "border-b border-neutral-300 print-break-inside-avoid",
                  idx % 2 === 1 ? "bg-neutral-50/70 print:bg-transparent" : "bg-white"
                )}
              >
                {/* Index */}
                <td className="border border-neutral-300 p-1.5 text-center font-mono text-[8pt] text-neutral-500">
                  {idx + 1}
                </td>

                {/* Checkbox */}
                <td className="border border-neutral-300 p-1.5 text-center">
                  <span className="inline-block w-3.5 h-3.5 border border-black font-bold text-[9pt] leading-3">
                    {task.isCompleted ? "✓" : ""}
                  </span>
                </td>

                {/* Title & Description */}
                <td className="border border-neutral-300 p-1.5">
                  <div
                    className={cn(
                      "font-semibold text-neutral-900",
                      task.isCompleted && "line-through text-neutral-500"
                    )}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-[8.5pt] print:text-[7pt] text-neutral-600 mt-0.5">
                      {task.description}
                    </div>
                  )}
                  {settings.includeNotes && task.notes && (
                    <div className="text-[8pt] text-neutral-500 italic mt-0.5">
                      Notes: {task.notes}
                    </div>
                  )}
                  {settings.includeSubtasks && task.subtasksCount > 0 && (
                    <div className="text-[7.5pt] font-mono text-neutral-400 mt-0.5">
                      Subtasks: {task.completedSubtasksCount}/{task.subtasksCount}
                    </div>
                  )}
                </td>

                {/* Category & Subcategory */}
                <td className="border border-neutral-300 p-1.5 text-xs print:text-[7.5pt]">
                  <div className="font-semibold text-neutral-800">{task.categoryName}</div>
                  <div className="text-neutral-500 text-[8pt]">{task.subcategoryName}</div>
                </td>

                {/* Priority */}
                {settings.includePriority && (
                  <td className="border border-neutral-300 p-1.5 text-center capitalize text-xs print:text-[7.5pt]">
                    <span
                      className={cn(
                        "font-medium",
                        task.priority === "urgent"
                          ? "text-rose-600 font-bold"
                          : task.priority === "high"
                          ? "text-amber-600 font-semibold"
                          : "text-neutral-600"
                      )}
                    >
                      {task.priority}
                    </span>
                  </td>
                )}

                {/* Due Date */}
                {settings.includeDueDates && (
                  <td className="border border-neutral-300 p-1.5 text-center font-mono text-xs print:text-[7.5pt]">
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </td>
                )}

                {/* Status */}
                {settings.includeStatus && (
                  <td className="border border-neutral-300 p-1.5 text-center capitalize text-xs print:text-[7.5pt]">
                    {task.status.replace("_", " ")}
                  </td>
                )}

                {/* Sign-off placeholder */}
                {settings.includeSignature && (
                  <td className="border border-neutral-300 p-1.5 text-center">
                    <span className="inline-block border-b border-neutral-300 w-16 h-3" />
                  </td>
                )}
              </tr>
            ))}

            {/* Empty Fill-in rows if configured */}
            {Array.from({ length: settings.emptyRowsCount }).map((_, i) => (
              <tr key={`empty-row-${i}`} className="border-b border-neutral-300">
                <td className="border border-neutral-300 p-1.5 text-center font-mono text-[8pt] text-neutral-400">
                  {total + i + 1}
                </td>
                <td className="border border-neutral-300 p-1.5 text-center">
                  <span className="inline-block w-3.5 h-3.5 border border-neutral-400" />
                </td>
                <td className="border border-neutral-300 p-1.5">
                  <div className="border-b border-neutral-300 h-4" />
                </td>
                <td className="border border-neutral-300 p-1.5">
                  <div className="border-b border-neutral-300 h-4" />
                </td>
                {settings.includePriority && (
                  <td className="border border-neutral-300 p-1.5">
                    <div className="border-b border-neutral-300 h-4" />
                  </td>
                )}
                {settings.includeDueDates && (
                  <td className="border border-neutral-300 p-1.5">
                    <div className="border-b border-neutral-300 h-4" />
                  </td>
                )}
                {settings.includeStatus && (
                  <td className="border border-neutral-300 p-1.5">
                    <div className="border-b border-neutral-300 h-4" />
                  </td>
                )}
                {settings.includeSignature && (
                  <td className="border border-neutral-300 p-1.5">
                    <div className="border-b border-neutral-300 h-4" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-300 print:text-[8pt] print-break-inside-avoid">
        <div>Total Entries: {total + settings.emptyRowsCount}</div>
        <div>Verified & Audited Date: _______________</div>
      </div>
    </div>
  );
}
