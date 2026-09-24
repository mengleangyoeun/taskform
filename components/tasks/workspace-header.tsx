"use client";

import {
  FolderPlus,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Download,
  ListTree,
  Kanban,
  LayoutDashboard,
  FileText,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceWithDetails } from "@/types/database";

interface WorkspaceHeaderProps {
  workspaces: WorkspaceWithDetails[];
  activeWorkspaceId: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    waitingTasks: number;
    notStartedTasks: number;
    overdueTasks: number;
    completionPercentage: number;
  };
  saveStatus: "saved" | "saving" | "error";
  viewMode: "hierarchy" | "board" | "dashboard" | "document";
  onSelectViewMode: (mode: "hierarchy" | "board" | "dashboard" | "document") => void;
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onEditWorkspace: () => void;
  onDeleteWorkspace: () => void;
  onAddCategory: () => void;
  onAddTask: () => void;
  onExport?: () => void;
  onOpenHelp?: () => void;
}

export function WorkspaceHeader({
  workspaces,
  activeWorkspaceId,
  stats,
  saveStatus,
  viewMode,
  onSelectViewMode,
  onSelectWorkspace,
  onNewWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onAddCategory,
  onAddTask,
  onExport,
  onOpenHelp,
}: WorkspaceHeaderProps) {
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-border/40">
      {/* Top Row on mobile: Workspace Title, Progress, and Primary Actions */}
      <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-2 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors cursor-pointer group truncate max-w-[180px] sm:max-w-xs">
                <span className="truncate">{activeWorkspace?.name || "Workspace"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={ws.id === activeWorkspaceId ? "font-semibold bg-accent text-accent-foreground" : ""}
                >
                  {ws.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onNewWorkspace}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quiet completion indicator */}
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {stats.completedTasks}/{stats.totalTasks}
          </span>

          {/* Save indicator dot */}
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              saveStatus === "saving"
                ? "bg-amber-500 animate-pulse"
                : saveStatus === "saved"
                ? "bg-emerald-500/70"
                : "bg-destructive"
            }`}
            title={saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save error"}
          />
        </div>

        {/* Mobile-only right actions */}
        <div className="flex sm:hidden items-center gap-1 shrink-0">
          <Button
            size="sm"
            onClick={onAddTask}
            className="h-7 text-xs px-2 gap-1 font-medium shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Task</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
                title="More workspace actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem onClick={onAddCategory}>
                <FolderPlus className="mr-2 h-3.5 w-3.5" />
                New Category
              </DropdownMenuItem>
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export / Print
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEditWorkspace}>
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                Rename Workspace
              </DropdownMenuItem>
              {onOpenHelp && (
                <DropdownMenuItem onClick={onOpenHelp}>
                  <HelpCircle className="mr-2 h-3.5 w-3.5" />
                  Keyboard Shortcuts (?)
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteWorkspace}
                className="text-destructive focus:text-destructive"
                disabled={workspaces.length <= 1}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center: View Switcher (Full width on mobile, centered on desktop) */}
      <div className="flex items-center p-0.5 bg-muted/40 rounded-lg border border-border/40 w-full sm:w-auto overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectViewMode("hierarchy")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            viewMode === "hierarchy"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTree className="h-3.5 w-3.5 shrink-0" />
          <span>Tasks</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("board")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            viewMode === "board"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Kanban className="h-3.5 w-3.5 shrink-0" />
          <span>Board</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("dashboard")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            viewMode === "dashboard"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("document")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            viewMode === "document"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>Document</span>
        </button>
      </div>

      {/* Desktop-only Right: Primary Action + Quiet Menu */}
      <div className="hidden sm:flex items-center gap-1.5">
        <Button
          size="sm"
          onClick={onAddTask}
          className="h-7.5 text-xs px-2.5 gap-1.5 font-medium shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Task</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground rounded-md"
              title="More workspace actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuItem onClick={onAddCategory}>
              <FolderPlus className="mr-2 h-3.5 w-3.5" />
              New Category
            </DropdownMenuItem>
            {onExport && (
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Export / Print
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEditWorkspace}>
              <Edit2 className="mr-2 h-3.5 w-3.5" />
              Rename Workspace
            </DropdownMenuItem>
            {onOpenHelp && (
              <DropdownMenuItem onClick={onOpenHelp}>
                <HelpCircle className="mr-2 h-3.5 w-3.5" />
                Keyboard Shortcuts (?)
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDeleteWorkspace}
              className="text-destructive focus:text-destructive"
              disabled={workspaces.length <= 1}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
