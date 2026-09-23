"use client";

import { useMemo } from "react";
import {
  WorkspaceWithDetails,
  TaskWithSubtasks,
} from "@/types/database";
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";

interface DashboardViewProps {
  workspace: WorkspaceWithDetails | null;
  onToggleTask: (id: string) => void;
}

export function DashboardView({ workspace, onToggleTask }: DashboardViewProps) {
  // Collect all tasks across all categories and subcategories
  const allTasksWithContext = useMemo(() => {
    if (!workspace) return [];

    const items: Array<{
      task: TaskWithSubtasks;
      categoryName: string;
      categoryColor: string;
      subcategoryName: string;
    }> = [];

    for (const cat of workspace.categories) {
      for (const sub of cat.subcategories) {
        for (const task of sub.tasks) {
          items.push({
            task,
            categoryName: cat.name,
            categoryColor: cat.color || "#3b82f6",
            subcategoryName: sub.name,
          });
        }
      }
    }

    return items;
  }, [workspace]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;
  const weekEnd = todayStart + 86400000 * 7;

  // Task lists
  const overdueTasks = allTasksWithContext.filter(
    ({ task }) =>
      task.status !== "completed" &&
      task.due_date &&
      new Date(task.due_date).getTime() < todayStart
  );

  const dueTodayTasks = allTasksWithContext.filter(({ task }) => {
    if (task.status === "completed" || !task.due_date) return false;
    const time = new Date(task.due_date).getTime();
    return time >= todayStart && time < todayEnd;
  });

  const dueThisWeekTasks = allTasksWithContext.filter(({ task }) => {
    if (task.status === "completed" || !task.due_date) return false;
    const time = new Date(task.due_date).getTime();
    return time >= todayEnd && time < weekEnd;
  });

  const highPriorityTasks = allTasksWithContext.filter(
    ({ task }) =>
      task.status !== "completed" && (task.priority === "urgent" || task.priority === "high")
  );

  const recentlyCompletedTasks = allTasksWithContext
    .filter(({ task }) => task.status === "completed" && task.completed_at)
    .sort(
      (a, b) =>
        new Date(b.task.completed_at!).getTime() - new Date(a.task.completed_at!).getTime()
    )
    .slice(0, 5);

  // Status breakdown
  const total = allTasksWithContext.length;
  const completed = allTasksWithContext.filter(({ task }) => task.status === "completed").length;
  const inProgress = allTasksWithContext.filter(({ task }) => task.status === "in_progress").length;
  const waiting = allTasksWithContext.filter(({ task }) => task.status === "waiting").length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <div className="bg-card/70 border border-border/50 rounded-lg p-3 shadow-2xs">
          <div className="text-[11px] text-muted-foreground font-medium">Total Tasks</div>
          <div className="text-xl font-bold mt-0.5 text-foreground">{total}</div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">All categories</div>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-lg p-3 shadow-2xs">
          <div className="text-[11px] text-muted-foreground font-medium">Completed</div>
          <div className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
            {completed}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">{completionPercentage}% finished</div>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-lg p-3 shadow-2xs">
          <div className="text-[11px] text-muted-foreground font-medium">In Progress</div>
          <div className="text-xl font-bold mt-0.5 text-sky-600 dark:text-sky-400">
            {inProgress}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">Active tasks</div>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-lg p-3 shadow-2xs">
          <div className="text-[11px] text-muted-foreground font-medium">Waiting</div>
          <div className="text-xl font-bold mt-0.5 text-amber-600 dark:text-amber-400">
            {waiting}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">Blocked</div>
        </div>

        <div className="bg-card/70 border border-border/50 rounded-lg p-3 shadow-2xs">
          <div className="text-[11px] text-muted-foreground font-medium">Overdue</div>
          <div
            className={`text-xl font-bold mt-0.5 ${
              overdueTasks.length > 0 ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {overdueTasks.length}
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-0.5">Needs action</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Overdue & High Priority Focus */}
        <div className="space-y-4">
          {/* Overdue Section */}
          <div className="bg-card/70 border border-border/50 rounded-lg p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <h3 className="font-semibold text-xs tracking-tight">Overdue Tasks</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-destructive/10 text-destructive font-semibold">
                {overdueTasks.length}
              </span>
            </div>

            {overdueTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                🎉 No overdue tasks.
              </p>
            ) : (
              <div className="space-y-1.5">
                {overdueTasks.map(({ task, categoryName, categoryColor, subcategoryName }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-md border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate text-foreground">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <span className="truncate">
                            {categoryName} → {subcategoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-destructive shrink-0 ml-2">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Priority Focus Section */}
          <div className="bg-card/70 border border-border/50 rounded-lg p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold text-xs tracking-tight">High & Urgent Priority</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-orange-500/10 text-orange-600 font-semibold">
                {highPriorityTasks.length}
              </span>
            </div>

            {highPriorityTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                No active urgent or high-priority tasks.
              </p>
            ) : (
              <div className="space-y-1.5">
                {highPriorityTasks.map(
                  ({ task, categoryName, categoryColor, subcategoryName }) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={() => onToggleTask(task.id)}
                          className="h-3.5 w-3.5"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-xs truncate">{task.title}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: categoryColor }}
                            />
                            <span className="truncate">
                              {categoryName} → {subcategoryName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={task.priority}
                        className="capitalize text-[10px] shrink-0 ml-2"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Due Today / This Week & Recently Completed */}
        <div className="space-y-4">
          {/* Due This Week Section */}
          <div className="bg-card/70 border border-border/50 rounded-lg p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-xs tracking-tight">Due Today & This Week</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-semibold">
                {dueTodayTasks.length + dueThisWeekTasks.length}
              </span>
            </div>

            {dueTodayTasks.length === 0 && dueThisWeekTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                No tasks scheduled for this week.
              </p>
            ) : (
              <div className="space-y-1.5">
                {/* Due Today */}
                {dueTodayTasks.map(({ task, categoryName, categoryColor, subcategoryName }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-md border border-primary/30 bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{task.title}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <span className="truncate">
                            {categoryName} → {subcategoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary shrink-0 ml-2">
                      TODAY
                    </span>
                  </div>
                ))}

                {/* Due Later This Week */}
                {dueThisWeekTasks.map(({ task, categoryName, categoryColor, subcategoryName }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-card hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{task.title}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <span className="truncate">
                            {categoryName} → {subcategoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed Section */}
          <div className="bg-card/70 border border-border/50 rounded-lg p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-xs tracking-tight">Recently Completed</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                {recentlyCompletedTasks.length}
              </span>
            </div>

            {recentlyCompletedTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                Completed tasks will appear here.
              </p>
            ) : (
              <div className="space-y-1.5">
                {recentlyCompletedTasks.map(({ task, categoryName, subcategoryName }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-md border border-border/30 bg-muted/20 opacity-80"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-xs line-through text-muted-foreground truncate">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {categoryName} → {subcategoryName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDate(task.completed_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
