"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { DocumentSettings } from "@/types/document";
import { formatDate } from "@/lib/utils";

interface TemplateProps {
  workspace: WorkspaceWithDetails;
  settings: DocumentSettings;
}

export function SimpleTemplate({ workspace, settings }: TemplateProps) {
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

  return (
    <div className="text-black font-mono text-[10pt] print:text-[8.5pt] leading-relaxed print:leading-tight space-y-4 print:space-y-2">
      {/* Simple Text Header */}
      <div className="border-b border-black pb-2 print:pb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="max-h-8 max-w-[100px] object-contain"
              />
            )}
            <div>
              {settings.organizationName && (
                <div className="text-xs print:text-[8pt] font-bold uppercase tracking-wider text-neutral-700">
                  {settings.organizationName}
                </div>
              )}
              <div className="text-base print:text-sm font-bold uppercase tracking-wider">
                {settings.customTitle || workspace.name}
              </div>
              {settings.headerSubtitle && (
                <div className="text-[10px] print:text-[7pt] text-neutral-600">
                  {settings.headerSubtitle}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs print:text-[7.5pt] text-neutral-600 text-right shrink-0">
            <div>Date: {formatDate(new Date())}</div>
            <div>Workspace: {workspace.name}</div>
          </div>
        </div>
      </div>

      {/* Categories & Tasks */}
      <div className="space-y-4 print:space-y-2">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="space-y-2 print:space-y-1">
            <div className="font-bold text-xs print:text-[8pt] uppercase border-b border-black pb-0.5 print-break-inside-avoid">
              [ {cat.name} ]
            </div>

            <div className="pl-3 print:pl-2 space-y-3 print:space-y-1.5">
              {cat.subcategories.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="font-semibold text-[11px] print:text-[7.5pt] text-neutral-700 print-break-inside-avoid">
                    &gt; {sub.name}
                  </div>

                  <div className="pl-3 print:pl-2 space-y-1">
                    {sub.tasks.map((task) => {
                      const isDone = task.status === "completed";
                      return (
                        <div key={task.id} className="text-xs print:text-[8pt] print-break-inside-avoid">
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 font-bold">
                              {isDone ? "[x]" : "[ ]"}
                            </span>
                            <span className={isDone ? "line-through text-neutral-500" : ""}>
                              {task.title}
                            </span>
                            {settings.includePriority && (
                              <span className="text-[10px] text-neutral-500">
                                ({task.priority})
                              </span>
                            )}
                            {settings.includeDueDates && task.due_date && (
                              <span className="text-[10px] text-neutral-500">
                                Due: {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>

                          {/* Subtasks */}
                          {settings.includeSubtasks &&
                            task.subtasks &&
                            task.subtasks.length > 0 && (
                              <div className="pl-6 space-y-0.5 mt-0.5 text-[10px]">
                                {task.subtasks.map((st) => (
                                  <div key={st.id} className="flex items-center gap-1.5">
                                    <span className="shrink-0">
                                      {st.status === "completed" ? "[x]" : "[-]"}
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

                    {/* Empty task slots */}
                    {Array.from({ length: settings.emptyRowsCount }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-2 text-xs">
                        <span>[ ]</span>
                        <span className="border-b border-neutral-300 w-48 h-3.5" />
                      </div>
                    ))}
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
