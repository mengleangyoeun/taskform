"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/database";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtaskRowProps {
  subtask: Task;
  parentTaskId: string;
  onToggle: (subtaskId: string, parentTaskId: string) => void;
  onDelete: (subtaskId: string, parentTaskId: string) => void;
}

export function SubtaskRow({
  subtask,
  parentTaskId,
  onToggle,
  onDelete,
}: SubtaskRowProps) {
  const isCompleted = subtask.status === "completed";

  return (
    <div className="group flex items-center justify-between py-1 px-2 rounded hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggle(subtask.id, parentTaskId)}
          aria-label={`Mark subtask ${subtask.title} as completed`}
          className="h-3.5 w-3.5"
        />
        <span
          className={cn(
            "text-xs select-none truncate transition-colors",
            isCompleted && "line-through text-muted-foreground/70 font-normal"
          )}
        >
          {subtask.title}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive rounded"
        onClick={() => onDelete(subtask.id, parentTaskId)}
        title="Delete subtask"
      >
        <Trash2 className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
}
