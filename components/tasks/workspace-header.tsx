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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
      {/* Left: Workspace Title & Progress */}
      <div className="flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground hover:text-foreground/80 transition-colors cursor-pointer group">
              <span>{activeWorkspace?.name || "Workspace"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
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
        <span className="text-xs text-muted-foreground font-mono">
          {stats.completedTasks}/{stats.totalTasks}
        </span>

        {/* Save indicator dot */}
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            saveStatus === "saving"
              ? "bg-amber-500 animate-pulse"
              : saveStatus === "saved"
              ? "bg-emerald-500/70"
              : "bg-destructive"
          }`}
          title={saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save error"}
        />
      </div>

      {/* Center: View Switcher */}
      <div className="inline-flex items-center p-0.5 bg-muted/40 rounded-lg border border-border/40 self-start sm:self-center">
        <button
          type="button"
          onClick={() => onSelectViewMode("hierarchy")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === "hierarchy"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>Tasks</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("board")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === "board"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Kanban className="h-3.5 w-3.5" />
          <span>Board</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("dashboard")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === "dashboard"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectViewMode("document")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewMode === "document"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Document</span>
        </button>
      </div>

      {/* Right: Primary Action + Quiet Menu */}
      <div className="flex items-center gap-1.5">
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
