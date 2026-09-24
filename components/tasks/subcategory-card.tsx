"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubcategoryWithTasks, TaskWithSubtasks } from "@/types/database";
import { TaskRow } from "@/components/tasks/task-row";
import { QuickAddTask } from "@/components/tasks/quick-add-task";

interface SubcategoryCardProps {
  subcategory: SubcategoryWithTasks;
  categoryName: string;
  onEditSubcategory: (sub: SubcategoryWithTasks) => void;
  onDeleteSubcategory: (id: string) => void;
  onToggleTask: (id: string) => void;
  onEditTask: (task: TaskWithSubtasks) => void;
  onDeleteTask: (id: string) => void;
  onQuickAddTask: (data: { subcategoryId: string; title: string }) => void;
  onCreateSubtask: (parentTaskId: string, subcategoryId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, parentTaskId: string) => void;
  onDeleteSubtask: (subtaskId: string, parentTaskId: string) => void;
  onReorderTasks?: (subcategoryId: string, activeTaskId: string, targetTaskId: string) => void;
  isSelectMode?: boolean;
  selectedTaskIds?: Set<string>;
  onToggleSelectTask?: (id: string) => void;
}

export function SubcategoryCard({
  subcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onReorderTasks,
  isSelectMode = false,
  selectedTaskIds,
  onToggleSelectTask,
}: SubcategoryCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState<string | null>(null);

  const totalTasks = subcategory.tasks.length;
  const completedTasks = subcategory.tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-1">
      {/* Subcategory Header */}
      <div className="flex items-center justify-between py-1 group/sub">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-left cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          )}
          <span className="font-semibold text-[11px] tracking-wider uppercase text-muted-foreground">
            {subcategory.name}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            ({completedTasks}/{totalTasks})
          </span>
        </button>

        <div className="opacity-100 sm:opacity-0 sm:group-hover/sub:opacity-100 transition-opacity flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground rounded">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              <DropdownMenuItem onClick={() => onEditSubcategory(subcategory)}>
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteSubcategory(subcategory.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Subcategory Content */}
      {isOpen && (
        <div className="space-y-0.5">
          {subcategory.tasks.length === 0 ? (
            <div className="py-2 px-2 text-[11px] text-muted-foreground/50 italic">
              No tasks
            </div>
          ) : (
            <div className="rounded-md overflow-hidden bg-card/40 border border-border/25">
              {subcategory.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onCreateSubtask={onCreateSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  isSelectMode={isSelectMode}
                  isSelected={selectedTaskIds?.has(task.id) || false}
                  onToggleSelect={onToggleSelectTask}
                  isDraggable={!isSelectMode}
                  isDragging={draggingTaskId === task.id}
                  isDropTarget={dropTargetTaskId === task.id}
                  onDragStart={(e, id) => {
                    setDraggingTaskId(id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", id);
                  }}
                  onDragOver={(_e, id) => {
                    if (draggingTaskId && draggingTaskId !== id) {
                      setDropTargetTaskId(id);
                    }
                  }}
                  onDragLeave={() => {}}
                  onDrop={(_e, targetId) => {
                    if (draggingTaskId && draggingTaskId !== targetId) {
                      onReorderTasks?.(subcategory.id, draggingTaskId, targetId);
                    }
                    setDraggingTaskId(null);
                    setDropTargetTaskId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingTaskId(null);
                    setDropTargetTaskId(null);
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick Add Task */}
          <div className="pt-0.5">
            <QuickAddTask
              subcategoryId={subcategory.id}
              onAdd={onQuickAddTask}
              placeholder={`+ Add task to ${subcategory.name}...`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
