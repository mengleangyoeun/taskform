"use client";

import { useState } from "react";
import {
  CategoryWithSubcategories,
  TaskWithSubtasks,
  TaskStatus,
} from "@/types/database";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  GripVertical,
  Calendar,
  Clock,
  CheckSquare,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Hourglass,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoardTask extends TaskWithSubtasks {
  categoryName: string;
  categoryColor: string;
  subcategoryId: string;
  subcategoryName: string;
}

interface BoardViewProps {
  categories: CategoryWithSubcategories[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: TaskWithSubtasks) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onQuickAddTask: (data: { subcategoryId: string; title: string; status?: TaskStatus }) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  color: string;
  icon: typeof Circle;
  headerBorder: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "not_started",
    title: "To Do",
    color: "text-zinc-500 dark:text-zinc-400",
    icon: Circle,
    headerBorder: "border-zinc-300 dark:border-zinc-700",
    badgeBg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "text-blue-500 dark:text-blue-400",
    icon: Clock,
    headerBorder: "border-blue-400/60",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "waiting",
    title: "Waiting",
    color: "text-purple-500 dark:text-purple-400",
    icon: Hourglass,
    headerBorder: "border-purple-400/60",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: "completed",
    title: "Done",
    color: "text-emerald-500 dark:text-emerald-400",
    icon: CheckCircle2,
    headerBorder: "border-emerald-400/60",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

export function BoardView({
  categories,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onQuickAddTask,
}: BoardViewProps) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [addingColumn, setAddingColumn] = useState<TaskStatus | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // Flatten all tasks across categories and subcategories
  const allTasks: BoardTask[] = categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.tasks.map((task) => ({
        ...task,
        categoryName: cat.name,
        categoryColor: cat.color || "#3b82f6",
        subcategoryId: sub.id,
        subcategoryName: sub.name,
      }))
    )
  );

  // Group tasks by status
  const tasksByColumn: Record<TaskStatus, BoardTask[]> = {
    not_started: allTasks.filter((t) => t.status === "not_started"),
    in_progress: allTasks.filter((t) => t.status === "in_progress"),
    waiting: allTasks.filter((t) => t.status === "waiting"),
    completed: allTasks.filter((t) => t.status === "completed"),
    cancelled: allTasks.filter((t) => t.status === "cancelled"),
  };

  // Find a fallback subcategory ID for adding new tasks
  const defaultSubcategoryId =
    categories[0]?.subcategories[0]?.id || "";

  const handleCreateCard = (status: TaskStatus) => {
    if (!newCardTitle.trim() || !defaultSubcategoryId) return;
    onQuickAddTask({
      subcategoryId: defaultSubcategoryId,
      title: newCardTitle.trim(),
      status,
    });
    setNewCardTitle("");
    setAddingColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-8">
      {COLUMNS.map((column) => {
        const tasks = tasksByColumn[column.id] || [];
        const isColumnDragOver = dragOverColumn === column.id;
        const IconComponent = column.icon;

        return (
          <div
            key={column.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverColumn !== column.id) {
                setDragOverColumn(column.id);
              }
            }}
            onDragLeave={(e) => {
              // Only reset if leaving the column element itself
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragOverColumn(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
              if (taskId) {
                onUpdateTaskStatus(taskId, column.id);
              }
              setDraggingTaskId(null);
              setDragOverColumn(null);
            }}
            className={cn(
              "flex flex-col rounded-xl bg-muted/20 border border-border/40 p-3 min-h-[460px] transition-all",
              isColumnDragOver && "border-primary/60 bg-primary/5 ring-2 ring-primary/20"
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-3">
              <div className="flex items-center gap-2">
                <IconComponent className={cn("h-4 w-4", column.color)} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {column.title}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium",
                    column.badgeBg
                  )}
                >
                  {tasks.length}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAddingColumn(column.id);
                  setNewCardTitle("");
                }}
                className="h-6 w-6 text-muted-foreground hover:text-foreground rounded"
                title={`Add task to ${column.title}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Tasks Cards Stack */}
            <div className="flex-1 space-y-2.5">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const overdue = isOverdue(task.due_date, isCompleted);
                const isDragging = draggingTaskId === task.id;
                const totalSubtasks = task.subtasks?.length || 0;
                const completedSubtasks =
                  task.subtasks?.filter((s) => s.status === "completed").length || 0;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingTaskId(task.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", task.id);
                    }}
                    onDragEnd={() => {
                      setDraggingTaskId(null);
                      setDragOverColumn(null);
                    }}
                    className={cn(
                      "group relative flex flex-col gap-2 p-3 rounded-lg bg-card border border-border/50 shadow-2xs hover:border-border hover:shadow-xs transition-all cursor-grab active:cursor-grabbing",
                      isDragging && "opacity-30 border-dashed border-primary",
                      isCompleted && "opacity-70 bg-card/60"
                    )}
                  >
                    {/* Card Header: Category Tag & Quick Menu */}
                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.categoryColor }}
                        />
                        <span className="text-muted-foreground uppercase font-medium tracking-tight truncate">
                          {task.categoryName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-foreground rounded"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 text-xs">
                            <DropdownMenuItem onClick={() => onEditTask(task)}>
                              <Edit2 className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteTask(task.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Card Body: Title & Description */}
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => onToggleTask(task.id)}
                        className="h-3.5 w-3.5 rounded-sm mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => onEditTask(task)}
                          className={cn(
                            "text-xs font-medium text-foreground hover:underline cursor-pointer leading-snug",
                            isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground/75 line-clamp-2 mt-1 leading-normal">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Badges & Metadata */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/30 text-[10px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Priority Badge */}
                        {task.priority === "urgent" && (
                          <span className="inline-flex items-center gap-0.5 text-rose-500 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded">
                            <span className="h-1 w-1 rounded-full bg-rose-500" />
                            Urgent
                          </span>
                        )}
                        {task.priority === "high" && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <span className="h-1 w-1 rounded-full bg-amber-500" />
                            High
                          </span>
                        )}

                        {/* Due Date */}
                        {task.due_date && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-mono",
                              overdue ? "text-destructive font-semibold" : "text-muted-foreground"
                            )}
                          >
                            <Calendar className="h-2.5 w-2.5 opacity-60" />
                            <span>{formatDate(task.due_date)}</span>
                          </span>
                        )}

                        {/* Subtasks Count */}
                        {totalSubtasks > 0 && (
                          <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
                            <CheckSquare className="h-2.5 w-2.5 opacity-60" />
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                          </span>
                        )}
                      </div>

                      {/* Drag Grip Indicator */}
                      <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                    </div>
                  </div>
                );
              })}

              {/* Empty state for column */}
              {tasks.length === 0 && addingColumn !== column.id && (
                <div className="py-8 text-center border border-dashed border-border/50 rounded-lg">
                  <p className="text-[11px] text-muted-foreground/60 italic">
                    No tasks
                  </p>
                </div>
              )}

              {/* Inline Quick Add Card */}
              {addingColumn === column.id && (
                <div className="p-2 rounded-lg bg-card border border-primary/40 shadow-xs space-y-2">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Enter task title..."
                    autoFocus
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCard(column.id);
                      }
                      if (e.key === "Escape") {
                        setAddingColumn(null);
                      }
                    }}
                    className="w-full text-xs bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingColumn(null)}
                      className="h-6 text-[11px] px-2 text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleCreateCard(column.id)}
                      className="h-6 text-[11px] px-2.5"
                    >
                      Add Card
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Add Task Button */}
            {addingColumn !== column.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingColumn(column.id);
                  setNewCardTitle("");
                }}
                className="w-full mt-3 h-7 text-xs text-muted-foreground hover:text-foreground justify-start gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add card</span>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
