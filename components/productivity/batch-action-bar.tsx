"use client";

import { X, CheckCircle2, RotateCcw, AlertTriangle, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskPriority, TaskStatus } from "@/types/database";

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkComplete: () => void;
  onMarkIncomplete: () => void;
  onUpdatePriority: (priority: TaskPriority) => void;
  onUpdateStatus: (status: TaskStatus) => void;
  onDeleteSelected: () => void;
}

export function BatchActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMarkComplete,
  onMarkIncomplete,
  onUpdatePriority,
  onUpdateStatus,
  onDeleteSelected,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 px-3.5 py-2 bg-background/90 backdrop-blur-xl border border-border/70 rounded-2xl shadow-2xl text-xs font-medium">
        {/* Selected count badge */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-border/50">
          <span className="h-5 px-1.5 rounded-full bg-primary text-primary-foreground font-mono font-semibold text-[11px] flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="text-foreground font-medium hidden sm:inline">selected</span>
          {selectedCount < totalCount ? (
            <button
              onClick={onSelectAll}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline cursor-pointer ml-1"
            >
              Select all ({totalCount})
            </button>
          ) : (
            <button
              onClick={onDeselectAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-1"
            >
              Deselect
            </button>
          )}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Mark Complete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkComplete}
            className="h-7 px-2 text-xs gap-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            title="Mark selected tasks as completed"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Done</span>
          </Button>

          {/* Mark Incomplete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkIncomplete}
            className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Mark selected tasks as not started"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">To Do</span>
          </Button>

          {/* Priority Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Priority</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="text-xs">
              <DropdownMenuItem onClick={() => onUpdatePriority("urgent")}>
                <span className="h-2 w-2 rounded-full bg-rose-500 mr-2" /> Urgent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdatePriority("high")}>
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2" /> High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdatePriority("medium")}>
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" /> Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdatePriority("low")}>
                <span className="h-2 w-2 rounded-full bg-muted-foreground mr-2" /> Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-blue-500" />
                <span className="hidden sm:inline">Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="text-xs">
              <DropdownMenuItem onClick={() => onUpdateStatus("not_started")}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("in_progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("waiting")}>
                Waiting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("cancelled")}>
                Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Selected */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            className="h-7 px-2 text-xs gap-1 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            title="Delete selected tasks"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>

        {/* Clear selection button */}
        <div className="pl-1 border-l border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeselectAll}
            className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
            title="Clear selection (Esc)"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
