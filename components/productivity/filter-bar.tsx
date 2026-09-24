"use client";

import { Search, X, SlidersHorizontal, ArrowUpDown, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterState, initialFilterState } from "@/lib/productivity/filter-sort";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  selectedCount?: number;
  onOpenCommandPalette?: () => void;
}

export function FilterBar({
  filters,
  onFilterChange,
  searchRef,
  isSelectMode,
  onToggleSelectMode,
  selectedCount = 0,
}: FilterBarProps) {
  const activeFiltersCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.priority !== "all" ? 1 : 0) +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.sortBy !== "manual" ? 1 : 0);

  const handleReset = () => {
    onFilterChange(initialFilterState);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search Input Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            ref={searchRef}
            placeholder="Search tasks... (press /)"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-8 pr-7 h-7.5 text-xs bg-muted/20 border-border/40 focus-visible:ring-1 focus-visible:ring-ring/40 rounded-md placeholder:text-muted-foreground/50 shadow-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={activeFiltersCount > 0 ? "secondary" : "ghost"}
              size="sm"
              className="h-7.5 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground rounded-md border border-border/40 shrink-0"
              title="Filter tasks"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="hidden sm:inline">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center font-semibold ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, status: "all" })}
              className={filters.status === "all" ? "font-semibold" : ""}
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, status: "in_progress" })}
              className={filters.status === "in_progress" ? "font-semibold text-blue-500" : ""}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, status: "completed" })}
              className={filters.status === "completed" ? "font-semibold text-emerald-500" : ""}
            >
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, status: "not_started" })}
              className={filters.status === "not_started" ? "font-semibold" : ""}
            >
              Not Started
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Priority
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, priority: "all" })}
              className={filters.priority === "all" ? "font-semibold" : ""}
            >
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, priority: "urgent" })}
              className={filters.priority === "urgent" ? "font-semibold text-rose-500" : ""}
            >
              Urgent Only
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, priority: "high" })}
              className={filters.priority === "high" ? "font-semibold text-amber-500" : ""}
            >
              High Priority
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Due Date
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, dateRange: "all" })}
              className={filters.dateRange === "all" ? "font-semibold" : ""}
            >
              Any Date
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, dateRange: "overdue" })}
              className={filters.dateRange === "overdue" ? "font-semibold text-destructive" : ""}
            >
              Overdue
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, dateRange: "today" })}
              className={filters.dateRange === "today" ? "font-semibold text-primary" : ""}
            >
              Due Today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, dateRange: "this_week" })}
              className={filters.dateRange === "this_week" ? "font-semibold" : ""}
            >
              Due This Week
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7.5 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground rounded-md border border-border/40 shrink-0"
              title="Sort tasks"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, sortBy: "manual" })}
              className={filters.sortBy === "manual" ? "font-semibold" : ""}
            >
              Manual Order
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, sortBy: "due_date_asc" })}
              className={filters.sortBy === "due_date_asc" ? "font-semibold" : ""}
            >
              Earliest Due
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, sortBy: "priority" })}
              className={filters.sortBy === "priority" ? "font-semibold" : ""}
            >
              Highest Priority
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onFilterChange({ ...filters, sortBy: "status" })}
              className={filters.sortBy === "status" ? "font-semibold" : ""}
            >
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Multi-Select Toggle */}
        {onToggleSelectMode && (
          <Button
            variant={isSelectMode ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggleSelectMode}
            className={`h-7.5 px-2 text-xs rounded-md gap-1 border border-border/40 shrink-0 ${
              isSelectMode
                ? "bg-primary/10 text-primary border-primary/40 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle batch selection mode"
          >
            <CheckSquare className="h-3 w-3" />
            <span className="hidden sm:inline">{isSelectMode ? `Done (${selectedCount})` : "Select"}</span>
          </Button>
        )}
      </div>

      {/* Active Filter Chips (Only rendered when filters are active) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {filters.status !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-muted/60 text-muted-foreground border border-border/40">
              <span>Status: <strong className="text-foreground capitalize">{filters.status.replace("_", " ")}</strong></span>
              <button
                onClick={() => onFilterChange({ ...filters, status: "all" })}
                className="hover:text-foreground ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {filters.priority !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-muted/60 text-muted-foreground border border-border/40">
              <span>Priority: <strong className="text-foreground capitalize">{filters.priority}</strong></span>
              <button
                onClick={() => onFilterChange({ ...filters, priority: "all" })}
                className="hover:text-foreground ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {filters.dateRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-muted/60 text-muted-foreground border border-border/40">
              <span>Due: <strong className="text-foreground capitalize">{filters.dateRange.replace("_", " ")}</strong></span>
              <button
                onClick={() => onFilterChange({ ...filters, dateRange: "all" })}
                className="hover:text-foreground ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          {filters.sortBy !== "manual" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-muted/60 text-muted-foreground border border-border/40">
              <span>Sort: <strong className="text-foreground capitalize">{filters.sortBy.replace("_", " ")}</strong></span>
              <button
                onClick={() => onFilterChange({ ...filters, sortBy: "manual" })}
                className="hover:text-foreground ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}

          <button
            onClick={handleReset}
            className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer ml-1"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
