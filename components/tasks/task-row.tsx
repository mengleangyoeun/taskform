"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  CheckSquare,
  Tag as TagIcon,
} from "lucide-react";
import { TaskWithSubtasks } from "@/types/database";
import { SubtaskRow } from "@/components/tasks/subtask-row";
import { formatDate, isOverdue, cn } from "@/lib/utils";

interface TaskRowProps {
  task: TaskWithSubtasks;
  onToggle: (id: string) => void;
  onEdit: (task: TaskWithSubtasks) => void;
  onDelete: (id: string) => void;
  onCreateSubtask: (parentTaskId: string, subcategoryId: string, title: string) => void;
  onToggleSubtask: (subtaskId: string, parentTaskId: string) => void;
  onDeleteSubtask: (subtaskId: string, parentTaskId: string) => void;
  // Selection mode
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  // Drag and drop reordering
  isDraggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
}

export function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  isDraggable = true,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: TaskRowProps) {
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isCompleted = task.status === "completed";
  const overdue = isOverdue(task.due_date, isCompleted);
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.status === "completed").length || 0;

  const hasMetadata =
    totalSubtasks > 0 ||
    task.priority === "urgent" ||
    task.priority === "high" ||
    task.status === "in_progress" ||
    task.status === "waiting" ||
    Boolean(task.due_date) ||
    Boolean(task.estimated_minutes && task.estimated_minutes > 0) ||
    Boolean(task.tags && task.tags.length > 0) ||
    Boolean(task.notes);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onCreateSubtask(task.id, task.subcategory_id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  return (
    <div
      draggable={!isSelectMode && isDraggable}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, task.id);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.(e, task.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group transition-colors relative py-1 px-2 rounded-md hover:bg-muted/30 border-b border-border/20 last:border-b-0",
        isCompleted && "opacity-60",
        isSelected && "bg-primary/5 ring-1 ring-primary/30",
        isDragging && "opacity-30 border-dashed border-primary",
        isDropTarget && "border-t-2 border-t-primary"
      )}
    >
      {/* Primary Line: Control Handles, Checkbox, Title, Hover Actions */}
      <div className="flex items-center gap-2">
        {/* Selection Checkbox OR Drag Handle */}
        {isSelectMode ? (
          <div className="shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(task.id)}
              className="data-[state=checked]:bg-primary h-3.5 w-3.5"
              aria-label={`Select task ${task.title}`}
            />
          </div>
        ) : (
          isDraggable && (
            <div
              className="opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 -ml-1 p-0.5 rounded hover:bg-muted"
              title="Drag to reorder"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          )
        )}

        {/* Status Checkbox */}
        <div className="shrink-0">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggle(task.id)}
            className="h-3.5 w-3.5 rounded-sm"
            aria-label={`Mark task ${task.title} as completed`}
          />
        </div>

        {/* Expand Subtasks toggle if subtasks exist */}
        {totalSubtasks > 0 && (
          <button
            type="button"
            onClick={() => setSubtasksOpen(!subtasksOpen)}
            className="text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 shrink-0"
            title={subtasksOpen ? "Collapse subtasks" : "Expand subtasks"}
          >
            {subtasksOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}

        {/* Task Title (Takes full line width, click to edit) */}
        <div className="flex-1 min-w-0">
          <span
            onClick={() => onEdit(task)}
            className={cn(
              "text-xs sm:text-[13px] text-foreground cursor-pointer hover:underline font-normal tracking-tight block truncate",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddingSubtask(true)}
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded"
            title="Add subtask"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded"
            title="Edit task"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-6 w-6 text-muted-foreground hover:text-destructive rounded"
            title="Delete task"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Second Line: Metadata Row (Subtasks, Priority, Status, Due Date, Tags, Notes) */}
      {hasMetadata && (
        <div className="flex items-center gap-2 flex-wrap pl-7 sm:pl-8 pt-0.5 text-[10px]">
          {/* Subtask count */}
          {totalSubtasks > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded">
              <CheckSquare className="h-2.5 w-2.5 opacity-70" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </span>
          )}

          {/* Priority indicator - only shown when urgent or high */}
          {task.priority === "urgent" && (
            <span className="inline-flex items-center gap-1 font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Urgent
            </span>
          )}
          {task.priority === "high" && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              High
            </span>
          )}

          {/* Status indicator - only shown when in_progress or waiting */}
          {task.status === "in_progress" && (
            <span className="inline-flex items-center gap-1 font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
              <Clock className="h-2.5 w-2.5" />
              In Progress
            </span>
          )}
          {task.status === "waiting" && (
            <span className="inline-flex items-center gap-1 font-medium text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">
              Waiting
            </span>
          )}

          {/* Due date */}
          {task.due_date && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono",
                overdue ? "text-destructive font-semibold" : "text-muted-foreground/70"
              )}
            >
              <Calendar className="h-2.5 w-2.5 opacity-60" />
              <span>{formatDate(task.due_date)}</span>
            </span>
          )}

          {/* Estimated minutes */}
          {task.estimated_minutes && task.estimated_minutes > 0 ? (
            <span className="inline-flex items-center gap-1 font-mono text-muted-foreground/70">
              <Clock className="h-2.5 w-2.5 opacity-60" />
              <span>{task.estimated_minutes}m</span>
            </span>
          ) : null}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground bg-muted/50 px-1 py-0.2 rounded"
                >
                  <TagIcon className="h-2 w-2 opacity-60" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Notes toggle button */}
          {task.notes && (
            <button
              type="button"
              onClick={() => setNotesOpen(!notesOpen)}
              className="inline-flex items-center gap-1 text-muted-foreground/70 hover:text-foreground cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50 transition-colors"
              title="Toggle notes"
            >
              <FileText className="h-2.5 w-2.5" />
              <span>Notes</span>
            </button>
          )}
        </div>
      )}

      {/* Description line if exists */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground/70 pl-7 sm:pl-8 pr-2 line-clamp-1 pb-0.5">
          {task.description}
        </p>
      )}

      {/* Notes block if expanded */}
      {notesOpen && task.notes && (
        <div className="my-1 ml-7 sm:ml-8 mr-2 p-2 bg-muted/30 rounded text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed border border-border/30">
          {task.notes}
        </div>
      )}

      {/* Inline Subtask Quick Add */}
      {isAddingSubtask && (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 ml-7 sm:ml-8 mr-2 my-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask title... (press Enter)"
            autoFocus
            className="flex-1 text-xs bg-background border border-border/50 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" size="sm" className="h-6 text-[11px] px-2">
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingSubtask(false)}
            className="h-6 text-[11px] px-1.5"
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Nested Subtasks List */}
      {subtasksOpen && totalSubtasks > 0 && (
        <div className="ml-7 sm:ml-8 pl-2 border-l border-border/30 my-1 space-y-0.5">
          {task.subtasks.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              parentTaskId={task.id}
              onToggle={onToggleSubtask}
              onDelete={onDeleteSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
