"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useTasks } from "@/lib/task-store";
import { WorkspaceHeader } from "@/components/tasks/workspace-header";
import { CategoryCard } from "@/components/tasks/category-card";
import { WorkspaceDialog } from "@/components/tasks/workspace-dialog";
import { CategoryDialog } from "@/components/tasks/category-dialog";
import { SubcategoryDialog } from "@/components/tasks/subcategory-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { DeleteConfirmDialog } from "@/components/tasks/delete-confirm-dialog";
import { UndoBanner } from "@/components/tasks/undo-banner";
import { FilterBar } from "@/components/productivity/filter-bar";
import { DashboardView } from "@/components/productivity/dashboard-view";
import { BoardView } from "@/components/productivity/board-view";
import { DocumentView } from "@/components/document/document-view";
import { DocumentRenderer } from "@/components/document/document-renderer";
import { ExportModal } from "@/components/export/export-modal";
import { defaultDocumentSettings, DocumentSettings } from "@/types/document";
import { KeyboardShortcutsDialog } from "@/components/productivity/keyboard-shortcuts-dialog";
import { CommandPalette } from "@/components/productivity/command-palette";
import { BatchActionBar } from "@/components/productivity/batch-action-bar";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { FilterState, initialFilterState, filterAndSortTasks } from "@/lib/productivity/filter-sort";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import {
  Category,
  CategoryWithSubcategories,
  SubcategoryWithTasks,
  TaskWithSubtasks,
  TaskPriority,
  TaskStatus,
} from "@/types/database";

export function WorkspaceView() {
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    stats,
    saveStatus,
    lastUndo,
    undo,
    clearUndo,
    setActiveWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    importWorkspace,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    reorderTasks,
    batchToggleComplete,
    batchUpdatePriority,
    batchUpdateStatus,
    batchDeleteTasks,
    createSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
  } = useTasks();

  // View Mode: hierarchy vs. board vs. dashboard vs. document preview
  const [viewMode, setViewMode] = useState<"hierarchy" | "board" | "dashboard" | "document">("hierarchy");
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(defaultDocumentSettings);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const searchRef = useRef<HTMLInputElement>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Dialog States
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [workspaceDialogData, setWorkspaceDialogData] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogData, setCategoryDialogData] = useState<Category | null>(null);

  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [subcategoryTargetCategoryId, setSubcategoryTargetCategoryId] = useState("");
  const [subcategoryTargetCategoryName, setSubcategoryTargetCategoryName] = useState("");
  const [subcategoryDialogData, setSubcategoryDialogData] = useState<SubcategoryWithTasks | null>(null);

  const [taskFormDialogOpen, setTaskFormDialogOpen] = useState(false);
  const [taskFormDefaultSubcategoryId, setTaskFormDefaultSubcategoryId] = useState<string | undefined>();
  const [taskFormEditingTask, setTaskFormEditingTask] = useState<TaskWithSubtasks | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");
  const [deleteConfirmDescription, setDeleteConfirmDescription] = useState("");
  const [deleteConfirmAction, setDeleteConfirmAction] = useState<() => void>(() => () => {});

  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Listen for open-command-palette event from Navbar or elsewhere
  useEffect(() => {
    const handleOpen = () => setCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  // Workspace Actions
  const handleNewWorkspace = () => {
    setWorkspaceDialogData(null);
    setWorkspaceDialogOpen(true);
  };

  const handleEditWorkspace = () => {
    if (!activeWorkspace) return;
    setWorkspaceDialogData({
      id: activeWorkspace.id,
      name: activeWorkspace.name,
      description: activeWorkspace.description,
    });
    setWorkspaceDialogOpen(true);
  };

  const handleDeleteWorkspace = () => {
    if (!activeWorkspace) return;
    setDeleteConfirmTitle("Delete Workspace");
    setDeleteConfirmDescription(
      `Are you sure you want to delete workspace "${activeWorkspace.name}"? All categories and tasks in it will be removed.`
    );
    setDeleteConfirmAction(() => () => deleteWorkspace(activeWorkspace.id));
    setDeleteConfirmOpen(true);
  };

  // Category Actions
  const handleAddCategory = () => {
    setCategoryDialogData(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (cat: CategoryWithSubcategories) => {
    setCategoryDialogData(cat);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    const cat = activeWorkspace?.categories.find((c) => c.id === id);
    setDeleteConfirmTitle("Delete Category");
    setDeleteConfirmDescription(
      `Are you sure you want to delete category "${cat?.name || "Category"}"? All associated subcategories and tasks will be deleted.`
    );
    setDeleteConfirmAction(() => () => deleteCategory(id));
    setDeleteConfirmOpen(true);
  };

  // Subcategory Actions
  const handleAddSubcategory = (categoryId: string) => {
    const cat = activeWorkspace?.categories.find((c) => c.id === categoryId);
    setSubcategoryTargetCategoryId(categoryId);
    setSubcategoryTargetCategoryName(cat?.name || "");
    setSubcategoryDialogData(null);
    setSubcategoryDialogOpen(true);
  };

  const handleEditSubcategory = (sub: SubcategoryWithTasks) => {
    setSubcategoryTargetCategoryId(sub.category_id);
    setSubcategoryDialogData(sub);
    setSubcategoryDialogOpen(true);
  };

  const handleDeleteSubcategory = (id: string) => {
    setDeleteConfirmTitle("Delete Subcategory");
    setDeleteConfirmDescription(
      "Are you sure you want to delete this subcategory and all of its tasks?"
    );
    setDeleteConfirmAction(() => () => deleteSubcategory(id));
    setDeleteConfirmOpen(true);
  };

  // Task Actions
  const handleAddTask = () => {
    const firstSub = activeWorkspace?.categories[0]?.subcategories[0]?.id;
    setTaskFormDefaultSubcategoryId(firstSub);
    setTaskFormEditingTask(null);
    setTaskFormDialogOpen(true);
  };

  const handleEditTask = (task: TaskWithSubtasks) => {
    setTaskFormEditingTask(task);
    setTaskFormDefaultSubcategoryId(task.subcategory_id);
    setTaskFormDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setDeleteConfirmTitle("Delete Task");
    setDeleteConfirmDescription("Are you sure you want to delete this task and its subtasks?");
    setDeleteConfirmAction(() => () => deleteTask(id));
    setDeleteConfirmOpen(true);
  };

  // Attach global keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: handleAddTask,
    onNewCategory: handleAddCategory,
    onFocusSearch: () => {
      setViewMode("hierarchy");
      setTimeout(() => searchRef.current?.focus(), 50);
    },
    onOpenHelp: () => setKeyboardHelpOpen(true),
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
  });

  // Filtered and sorted category tree
  const filteredCategories = useMemo(() => {
    if (!activeWorkspace) return [];
    return filterAndSortTasks(activeWorkspace.categories, filters);
  }, [activeWorkspace, filters]);

  // All visible task IDs for Select All
  const visibleTaskIds = useMemo(() => {
    const ids: string[] = [];
    for (const cat of filteredCategories) {
      for (const sub of cat.subcategories) {
        for (const t of sub.tasks) {
          ids.push(t.id);
        }
      }
    }
    return ids;
  }, [filteredCategories]);

  // Selection handlers
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedTaskIds(new Set(visibleTaskIds));
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds(new Set());
  };

  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => {
      if (prev) {
        setSelectedTaskIds(new Set());
      }
      return !prev;
    });
  };

  // Batch operations
  const handleBatchMarkComplete = async () => {
    await batchToggleComplete(Array.from(selectedTaskIds), true);
    setSelectedTaskIds(new Set());
  };

  const handleBatchMarkIncomplete = async () => {
    await batchToggleComplete(Array.from(selectedTaskIds), false);
    setSelectedTaskIds(new Set());
  };

  const handleBatchUpdatePriority = async (priority: TaskPriority) => {
    await batchUpdatePriority(Array.from(selectedTaskIds), priority);
    setSelectedTaskIds(new Set());
  };

  const handleBatchUpdateStatus = async (status: TaskStatus) => {
    await batchUpdateStatus(Array.from(selectedTaskIds), status);
    setSelectedTaskIds(new Set());
  };

  const handleBatchDelete = () => {
    const count = selectedTaskIds.size;
    setDeleteConfirmTitle("Delete Tasks");
    setDeleteConfirmDescription(
      `Are you sure you want to delete ${count} selected tasks and their subtasks?`
    );
    setDeleteConfirmAction(() => async () => {
      await batchDeleteTasks(Array.from(selectedTaskIds));
      setSelectedTaskIds(new Set());
    });
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* Consolidated Workspace Header with View Tabs & Actions */}
      <div className="no-print">
        <WorkspaceHeader
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          stats={stats}
          saveStatus={saveStatus}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
          onSelectWorkspace={setActiveWorkspaceId}
          onNewWorkspace={handleNewWorkspace}
          onEditWorkspace={handleEditWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onAddCategory={handleAddCategory}
          onAddTask={handleAddTask}
          onExport={() => setExportModalOpen(true)}
          onOpenHelp={() => setKeyboardHelpOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      {viewMode === "document" ? (
        <DocumentView
          workspace={activeWorkspace}
          settings={documentSettings}
          onSettingsChange={setDocumentSettings}
        />
      ) : viewMode === "dashboard" ? (
        <div className="no-print">
          <DashboardView
            workspace={activeWorkspace}
            onToggleTask={toggleTaskComplete}
          />
        </div>
      ) : viewMode === "board" ? (
        <div className="space-y-4 no-print">
          {/* Search & Filter Toolbar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            searchRef={searchRef}
            isSelectMode={isSelectMode}
            onToggleSelectMode={handleToggleSelectMode}
            selectedCount={selectedTaskIds.size}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          {!activeWorkspace || activeWorkspace.categories.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card/40 p-8 space-y-4">
              <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">No categories in this workspace</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start by creating a category (e.g. Work, Personal, or Projects) to organize your tasks.
                </p>
              </div>
              <Button onClick={handleAddCategory} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </div>
          ) : (
            <BoardView
              categories={filteredCategories}
              onToggleTask={toggleTaskComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={(taskId, newStatus) => {
                updateTask(taskId, {
                  status: newStatus,
                  completed_at: newStatus === "completed" ? new Date().toISOString() : null,
                });
              }}
              onQuickAddTask={({ subcategoryId, title, status }) => {
                createTask({
                  subcategoryId,
                  title,
                  status: status || "not_started",
                });
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4 no-print">
          {/* Search & Filter Toolbar */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            searchRef={searchRef}
            isSelectMode={isSelectMode}
            onToggleSelectMode={handleToggleSelectMode}
            selectedCount={selectedTaskIds.size}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          {/* Main Hierarchy Content */}
          {!activeWorkspace || activeWorkspace.categories.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl bg-card/40 p-8 space-y-4">
              <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">No categories in this workspace</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start by creating a category (e.g. Work, Personal, or Projects) to organize your tasks.
                </p>
              </div>
              <Button onClick={handleAddCategory} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 border rounded-xl bg-card p-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                No tasks match your current search and filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(initialFilterState)}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddSubcategory={handleAddSubcategory}
                  onEditSubcategory={handleEditSubcategory}
                  onDeleteSubcategory={handleDeleteSubcategory}
                  onToggleTask={toggleTaskComplete}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onQuickAddTask={createTask}
                  onCreateSubtask={createSubtask}
                  onToggleSubtask={toggleSubtaskComplete}
                  onDeleteSubtask={deleteSubtask}
                  onReorderTasks={reorderTasks}
                  isSelectMode={isSelectMode}
                  selectedTaskIds={selectedTaskIds}
                  onToggleSelectTask={handleToggleSelectTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Print-only Document Form (Activated whenever user prints from Hierarchy or Dashboard) */}
      {viewMode !== "document" && activeWorkspace && (
        <div className="hidden print:block print:w-full print:m-0 print:p-0">
          <DocumentRenderer workspace={activeWorkspace} settings={documentSettings} />
        </div>
      )}

      {/* Workspace Create/Edit Dialog */}
      <WorkspaceDialog
        open={workspaceDialogOpen}
        onOpenChange={setWorkspaceDialogOpen}
        initialData={workspaceDialogData}
        onSubmit={(name, desc) => {
          if (workspaceDialogData) {
            updateWorkspace(workspaceDialogData.id, name, desc);
          } else {
            createWorkspace(name, desc);
          }
        }}
      />

      {/* Category Create/Edit Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        initialData={categoryDialogData}
        onSubmit={(data) => {
          if (categoryDialogData) {
            updateCategory(categoryDialogData.id, data);
          } else {
            createCategory(data);
          }
        }}
      />

      {/* Subcategory Create/Edit Dialog */}
      <SubcategoryDialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
        categoryId={subcategoryTargetCategoryId}
        categoryName={subcategoryTargetCategoryName}
        initialData={subcategoryDialogData}
        onSubmit={(data) => {
          if (subcategoryDialogData) {
            updateSubcategory(subcategoryDialogData.id, data);
          } else {
            createSubcategory(subcategoryTargetCategoryId, data);
          }
        }}
      />

      {/* Task Form Dialog (Add / Edit) */}
      <TaskFormDialog
        open={taskFormDialogOpen}
        onOpenChange={setTaskFormDialogOpen}
        workspace={activeWorkspace}
        defaultSubcategoryId={taskFormDefaultSubcategoryId}
        initialTask={taskFormEditingTask}
        onSubmit={(data) => {
          if (data.id) {
            updateTask(data.id, {
              title: data.title,
              description: data.description,
              notes: data.notes,
              subcategory_id: data.subcategoryId,
              priority: data.priority,
              status: data.status,
              due_date: data.dueDate,
              start_date: data.startDate,
              estimated_minutes: data.estimatedMinutes,
            });
          } else {
            createTask(data);
          }
        }}
      />

      {/* Destructive Action Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={deleteConfirmTitle}
        description={deleteConfirmDescription}
        onConfirm={deleteConfirmAction}
      />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsDialog
        open={keyboardHelpOpen}
        onOpenChange={setKeyboardHelpOpen}
      />

      {/* Export & Import Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        workspace={activeWorkspace}
        settings={documentSettings}
        onImportWorkspace={importWorkspace}
      />

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedTaskIds.size}
        totalCount={visibleTaskIds.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onMarkComplete={handleBatchMarkComplete}
        onMarkIncomplete={handleBatchMarkIncomplete}
        onUpdatePriority={handleBatchUpdatePriority}
        onUpdateStatus={handleBatchUpdateStatus}
        onDeleteSelected={handleBatchDelete}
      />

      {/* Command Palette (⌘K) */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        workspace={activeWorkspace}
        onAddTask={handleAddTask}
        onAddCategory={handleAddCategory}
        onSwitchView={setViewMode}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenHelp={() => setKeyboardHelpOpen(true)}
        onToggleTaskComplete={toggleTaskComplete}
        onEditTask={handleEditTask}
      />

      {/* Floating Undo Banner */}
      {lastUndo && (
        <div className="no-print">
          <UndoBanner
            description={lastUndo.description}
            onUndo={undo}
            onDismiss={clearUndo}
          />
        </div>
      )}
    </div>
  );
}
