"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  WorkspaceWithDetails,
  TaskWithSubtasks,
} from "@/types/database";
import {
  Search,
  Plus,
  FolderPlus,
  ListTree,
  LayoutDashboard,
  FileText,
  Download,
  Printer,
  Moon,
  HelpCircle,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceWithDetails | null;
  onAddTask: () => void;
  onAddCategory: () => void;
  onSwitchView: (view: "hierarchy" | "dashboard" | "document") => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onToggleTaskComplete?: (taskId: string) => void;
  onEditTask?: (task: TaskWithSubtasks) => void;
}

interface PaletteItem {
  id: string;
  category: "actions" | "tasks" | "navigation";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  hotkey?: string;
  onSelect: () => void;
}

function CommandPaletteInner({
  onClose,
  workspace,
  onAddTask,
  onAddCategory,
  onSwitchView,
  onOpenExport,
  onOpenHelp,
  onToggleTaskComplete,
  onEditTask,
}: {
  onClose: () => void;
  workspace: WorkspaceWithDetails | null;
  onAddTask: () => void;
  onAddCategory: () => void;
  onSwitchView: (view: "hierarchy" | "dashboard" | "document") => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onToggleTaskComplete?: (taskId: string) => void;
  onEditTask?: (task: TaskWithSubtasks) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Toggle theme action
  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const willBeDark = !root.classList.contains("dark");
      if (willBeDark) {
        root.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch {}
      } else {
        root.classList.remove("dark");
        try {
          localStorage.setItem("theme", "light");
        } catch {}
      }
    }
  };

  // Build items list
  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    const q = query.trim().toLowerCase();

    // 1. Actions / Commands
    const actions: PaletteItem[] = [
      {
        id: "act-new-task",
        category: "actions",
        title: "Create New Task",
        subtitle: "Add a task to a subcategory",
        icon: <Plus className="h-4 w-4 text-primary" />,
        hotkey: "N",
        onSelect: () => {
          onClose();
          onAddTask();
        },
      },
      {
        id: "act-new-cat",
        category: "actions",
        title: "Create New Category",
        subtitle: "Add a high-level grouping",
        icon: <FolderPlus className="h-4 w-4 text-primary" />,
        hotkey: "C",
        onSelect: () => {
          onClose();
          onAddCategory();
        },
      },
      {
        id: "act-view-hierarchy",
        category: "actions",
        title: "Switch to Tasks View",
        subtitle: "Interactive hierarchical to-do list",
        icon: <ListTree className="h-4 w-4 text-blue-500" />,
        hotkey: "1",
        onSelect: () => {
          onClose();
          onSwitchView("hierarchy");
        },
      },
      {
        id: "act-view-dashboard",
        category: "actions",
        title: "Switch to Dashboard View",
        subtitle: "Productivity analytics & task status",
        icon: <LayoutDashboard className="h-4 w-4 text-emerald-500" />,
        hotkey: "2",
        onSelect: () => {
          onClose();
          onSwitchView("dashboard");
        },
      },
      {
        id: "act-view-document",
        category: "actions",
        title: "Switch to Document View",
        subtitle: "Printable single-page document preview",
        icon: <FileText className="h-4 w-4 text-amber-500" />,
        hotkey: "3",
        onSelect: () => {
          onClose();
          onSwitchView("document");
        },
      },
      {
        id: "act-export",
        category: "actions",
        title: "Export Workspace",
        subtitle: "Download Word (.docx), PDF, Images, JSON, CSV",
        icon: <Download className="h-4 w-4 text-purple-500" />,
        onSelect: () => {
          onClose();
          onOpenExport();
        },
      },
      {
        id: "act-print",
        category: "actions",
        title: "Print Form",
        subtitle: "Print clean single-page document to physical printer or PDF",
        icon: <Printer className="h-4 w-4 text-indigo-500" />,
        hotkey: "⌘P",
        onSelect: () => {
          onClose();
          setTimeout(() => window.print(), 150);
        },
      },
      {
        id: "act-theme",
        category: "actions",
        title: "Toggle Light / Dark Mode",
        subtitle: "Switch interface visual theme",
        icon: <Moon className="h-4 w-4 text-foreground" />,
        onSelect: () => {
          onClose();
          toggleTheme();
        },
      },
      {
        id: "act-help",
        category: "actions",
        title: "Keyboard Shortcuts Help",
        subtitle: "View complete list of hotkeys",
        icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
        hotkey: "?",
        onSelect: () => {
          onClose();
          onOpenHelp();
        },
      },
    ];

    // Filter actions by query
    const matchedActions = q
      ? actions.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            (a.subtitle && a.subtitle.toLowerCase().includes(q))
        )
      : actions;

    list.push(...matchedActions);

    // 2. Search Tasks in Workspace
    if (workspace) {
      const taskItems: PaletteItem[] = [];
      for (const cat of workspace.categories) {
        for (const sub of cat.subcategories) {
          for (const task of sub.tasks) {
            const matchesQuery =
              !q ||
              task.title.toLowerCase().includes(q) ||
              (task.description && task.description.toLowerCase().includes(q)) ||
              (task.notes && task.notes.toLowerCase().includes(q)) ||
              cat.name.toLowerCase().includes(q) ||
              sub.name.toLowerCase().includes(q);

            if (matchesQuery) {
              const isDone = task.status === "completed";
              taskItems.push({
                id: `task-${task.id}`,
                category: "tasks",
                title: task.title,
                subtitle: `${cat.name} > ${sub.name}`,
                badge: task.priority !== "medium" ? task.priority : undefined,
                icon: isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : task.status === "in_progress" ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/60" />
                ),
                onSelect: () => {
                  onClose();
                  if (onEditTask) {
                    onEditTask(task);
                  } else if (onToggleTaskComplete) {
                    onToggleTaskComplete(task.id);
                  }
                },
              });
            }
          }
        }
      }
      list.push(...taskItems);
    }

    return list;
  }, [
    query,
    workspace,
    onClose,
    onAddTask,
    onAddCategory,
    onSwitchView,
    onOpenExport,
    onOpenHelp,
    onToggleTaskComplete,
    onEditTask,
  ]);

  const activeIndex = items.length > 0 ? Math.min(selectedIndex, items.length - 1) : 0;

  // Handle keyboard navigation in palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, items.length - 1)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[activeIndex]) {
        items[activeIndex].onSelect();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <>
      {/* Search Input Bar */}
      <div className="flex items-center px-3.5 py-3 border-b border-border/40 gap-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a command or search tasks..."
          className="flex-1 bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/40 rounded">
          ESC
        </kbd>
      </div>

      {/* Results List */}
      <div
        ref={listRef}
        className="max-h-80 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-border/20"
      >
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No matching commands or tasks found.
          </div>
        ) : (
          items.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={item.id}
                data-index={index}
                onClick={() => item.onSelect()}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-foreground/80 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex flex-col">
                    <span className="truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                  {item.hotkey && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted/60 border border-border/40 rounded text-muted-foreground">
                      {item.hotkey}
                    </kbd>
                  )}
                  {isSelected && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-60 ml-0.5" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer shortcuts hint */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-muted/20 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            <kbd className="font-mono bg-muted px-1 rounded border border-border/40">↑</kbd>{" "}
            <kbd className="font-mono bg-muted px-1 rounded border border-border/40">↓</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono bg-muted px-1 rounded border border-border/40">↵</kbd> select
          </span>
        </div>
        <span className="hidden sm:inline">
          Press <kbd className="font-mono bg-muted px-1 rounded border border-border/40">⌘K</kbd> anytime
        </span>
      </div>
    </>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  workspace,
  onAddTask,
  onAddCategory,
  onSwitchView,
  onOpenExport,
  onOpenHelp,
  onToggleTaskComplete,
  onEditTask,
}: CommandPaletteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        {open && (
          <CommandPaletteInner
            onClose={() => onOpenChange(false)}
            workspace={workspace}
            onAddTask={onAddTask}
            onAddCategory={onAddCategory}
            onSwitchView={onSwitchView}
            onOpenExport={onOpenExport}
            onOpenHelp={onOpenHelp}
            onToggleTaskComplete={onToggleTaskComplete}
            onEditTask={onEditTask}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
