export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "waiting"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  subcategory_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  start_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  color: string;
  created_at: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface TemplateSubcategory {
  id: string;
  template_category_id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface TemplateTask {
  id: string;
  template_subcategory_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  sort_order: number;
}

// Hierarchical composite types for frontend presentation & document generation
export interface TaskWithSubtasks extends Task {
  subtasks: Task[];
  tags?: Tag[];
}

export interface SubcategoryWithTasks extends Subcategory {
  tasks: TaskWithSubtasks[];
}

export interface CategoryWithSubcategories extends Category {
  subcategories: SubcategoryWithTasks[];
}

export interface WorkspaceWithDetails extends Workspace {
  categories: CategoryWithSubcategories[];
}
