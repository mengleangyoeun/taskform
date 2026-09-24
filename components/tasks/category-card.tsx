"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryWithSubcategories, SubcategoryWithTasks, TaskWithSubtasks } from "@/types/database";
import { SubcategoryCard } from "@/components/tasks/subcategory-card";

interface CategoryCardProps {
  category: CategoryWithSubcategories;
  onEditCategory: (cat: CategoryWithSubcategories) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubcategory: (categoryId: string) => void;
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

export function CategoryCard({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
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
  isSelectMode,
  selectedTaskIds,
  onToggleSelectTask,
}: CategoryCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate total tasks across subcategories
  const allTasks = category.subcategories.flatMap((s) => s.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-2">
      {/* Category Section Header */}
      <div className="flex items-center justify-between py-1 group/cat border-b border-border/30 pb-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}

          {/* Color indicator dot */}
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: category.color || "#3b82f6" }}
          />

          <span className="font-semibold text-xs tracking-wider uppercase text-foreground">
            {category.name}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {completedTasks}/{totalTasks}
          </span>
        </button>

        {/* Quiet Actions */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/cat:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground rounded"
            onClick={() => onAddSubcategory(category.id)}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline text-[11px]">Subcategory</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground rounded">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem onClick={() => onAddSubcategory(category.id)}>
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteCategory(category.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Category Content (Subcategories) */}
      {isOpen && (
        <div className="space-y-4 pt-1 pl-1">
          {category.description && (
            <p className="text-[11px] text-muted-foreground/70">{category.description}</p>
          )}

          {category.subcategories.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-border/30 rounded text-xs text-muted-foreground">
              No subcategories yet.{" "}
              <button
                onClick={() => onAddSubcategory(category.id)}
                className="text-primary hover:underline font-medium"
              >
                Add one
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {category.subcategories.map((subcategory) => (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  categoryName={category.name}
                  onEditSubcategory={onEditSubcategory}
                  onDeleteSubcategory={onDeleteSubcategory}
                  onToggleTask={onToggleTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onQuickAddTask={onQuickAddTask}
                  onCreateSubtask={onCreateSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onReorderTasks={onReorderTasks}
                  isSelectMode={isSelectMode}
                  selectedTaskIds={selectedTaskIds}
                  onToggleSelectTask={onToggleSelectTask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
