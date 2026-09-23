"use client";

import { WorkspaceWithDetails } from "@/types/database";
import { downloadText } from "@/lib/export/download";

export function exportToJson(workspace: WorkspaceWithDetails): void {
  const data = JSON.stringify(workspace, null, 2);
  const cleanName = (workspace.name || "tasks").toLowerCase().replace(/[^a-z0-9]/g, "-");
  downloadText(data, `${cleanName}-data.json`, "application/json");
}

export function exportToCsv(workspace: WorkspaceWithDetails): void {
  const headers = [
    "Workspace",
    "Category",
    "Subcategory",
    "Item Type",
    "Title",
    "Description",
    "Priority",
    "Status",
    "Due Date",
    "Start Date",
    "Completed At",
    "Estimated Minutes",
    "Notes",
  ];

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [headers.join(",")];

  for (const cat of workspace.categories) {
    for (const sub of cat.subcategories) {
      for (const task of sub.tasks) {
        rows.push(
          [
            escapeCsv(workspace.name),
            escapeCsv(cat.name),
            escapeCsv(sub.name),
            escapeCsv("Task"),
            escapeCsv(task.title),
            escapeCsv(task.description),
            escapeCsv(task.priority),
            escapeCsv(task.status),
            escapeCsv(task.due_date),
            escapeCsv(task.start_date),
            escapeCsv(task.completed_at),
            escapeCsv(task.estimated_minutes),
            escapeCsv(task.notes),
          ].join(",")
        );

        if (task.subtasks) {
          for (const st of task.subtasks) {
            rows.push(
              [
                escapeCsv(workspace.name),
                escapeCsv(cat.name),
                escapeCsv(sub.name),
                escapeCsv("Subtask"),
                escapeCsv(st.title),
                escapeCsv(st.description),
                escapeCsv(st.priority),
                escapeCsv(st.status),
                escapeCsv(st.due_date),
                escapeCsv(st.start_date),
                escapeCsv(st.completed_at),
                escapeCsv(st.estimated_minutes),
                escapeCsv(st.notes),
              ].join(",")
            );
          }
        }
      }
    }
  }

  const csvContent = rows.join("\r\n");
  const cleanName = (workspace.name || "tasks").toLowerCase().replace(/[^a-z0-9]/g, "-");
  downloadText(csvContent, `${cleanName}-data.csv`, "text/csv");
}

export function parseWorkspaceJson(jsonStr: string): WorkspaceWithDetails {
  const data = JSON.parse(jsonStr);
  if (!data.name || !Array.isArray(data.categories)) {
    throw new Error("Invalid workspace JSON structure");
  }
  return {
    ...data,
    id: "ws-imported-" + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
