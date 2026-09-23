import {
  CategoryWithSubcategories,
  TaskPriority,
  TaskStatus,
} from "@/types/database";

export interface FilterState {
  searchQuery: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  dateRange: "all" | "overdue" | "today" | "this_week";
  completion: "all" | "completed" | "uncompleted";
  sortBy: "manual" | "due_date_asc" | "due_date_desc" | "priority" | "status" | "title";
}

export const initialFilterState: FilterState = {
  searchQuery: "",
  status: "all",
  priority: "all",
  dateRange: "all",
  completion: "all",
  sortBy: "manual",
};

const priorityRank: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(
  categories: CategoryWithSubcategories[],
  filters: FilterState
): CategoryWithSubcategories[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;
  const weekEnd = todayStart + 86400000 * 7;

  return categories
    .map((category) => {
      const categoryMatchesQuery = query && category.name.toLowerCase().includes(query);

      const filteredSubcategories = category.subcategories
        .map((subcategory) => {
          const subcategoryMatchesQuery =
            query && subcategory.name.toLowerCase().includes(query);

          const filteredTasks = subcategory.tasks.filter((task) => {
            // Search text match (task title, description, notes, or matching parent category/subcategory)
            if (query && !categoryMatchesQuery && !subcategoryMatchesQuery) {
              const inTitle = task.title.toLowerCase().includes(query);
              const inDesc = task.description?.toLowerCase().includes(query);
              const inNotes = task.notes?.toLowerCase().includes(query);
              const inSubtasks = task.subtasks?.some((st) =>
                st.title.toLowerCase().includes(query)
              );
              if (!inTitle && !inDesc && !inNotes && !inSubtasks) return false;
            }

            // Status filter
            if (filters.status !== "all" && task.status !== filters.status) {
              return false;
            }

            // Priority filter
            if (filters.priority !== "all" && task.priority !== filters.priority) {
              return false;
            }

            // Completion filter
            if (filters.completion === "completed" && task.status !== "completed") {
              return false;
            }
            if (filters.completion === "uncompleted" && task.status === "completed") {
              return false;
            }

            // Date range filter
            if (filters.dateRange !== "all") {
              if (!task.due_date) return false;
              const dueTime = new Date(task.due_date).getTime();

              if (filters.dateRange === "overdue") {
                if (dueTime >= todayStart || task.status === "completed") return false;
              } else if (filters.dateRange === "today") {
                if (dueTime < todayStart || dueTime >= todayEnd) return false;
              } else if (filters.dateRange === "this_week") {
                if (dueTime < todayStart || dueTime >= weekEnd) return false;
              }
            }

            return true;
          });

          // Sort tasks
          const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (filters.sortBy === "due_date_asc") {
              if (!a.due_date) return 1;
              if (!b.due_date) return -1;
              return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (filters.sortBy === "due_date_desc") {
              if (!a.due_date) return 1;
              if (!b.due_date) return -1;
              return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
            }
            if (filters.sortBy === "priority") {
              return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
            }
            if (filters.sortBy === "status") {
              return a.status.localeCompare(b.status);
            }
            if (filters.sortBy === "title") {
              return a.title.localeCompare(b.title);
            }
            // manual
            return a.sort_order - b.sort_order;
          });

          return {
            ...subcategory,
            tasks: sortedTasks,
          };
        })
        .filter((sub) => {
          // If filtering is active, hide empty subcategories
          const isFilterActive =
            filters.searchQuery ||
            filters.status !== "all" ||
            filters.priority !== "all" ||
            filters.dateRange !== "all" ||
            filters.completion !== "all";
          return !isFilterActive || sub.tasks.length > 0;
        });

      return {
        ...category,
        subcategories: filteredSubcategories,
      };
    })
    .filter((cat) => {
      const isFilterActive =
        filters.searchQuery ||
        filters.status !== "all" ||
        filters.priority !== "all" ||
        filters.dateRange !== "all" ||
        filters.completion !== "all";
      return !isFilterActive || cat.subcategories.length > 0;
    });
}
