import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100, "Category name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().nullable(),
  icon: z.string().optional().default("folder"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#3b82f6"),
});

export const subcategorySchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  name: z.string().trim().min(1, "Subcategory name is required").max(100, "Subcategory name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Task title is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
  subcategoryId: z.string().uuid("Please select a subcategory"),
  parentTaskId: z.string().uuid().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["not_started", "in_progress", "waiting", "completed", "cancelled"]).default("not_started"),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedMinutes: z.number().int().nonnegative().optional().nullable(),
  actualMinutes: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(2000, "Notes are too long").optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const quickTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  subcategoryId: z.string().uuid(),
  parentTaskId: z.string().uuid().optional().nullable(),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(50, "Tag name is too long"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#6b7280"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type SubcategoryInput = z.infer<typeof subcategorySchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type QuickTaskInput = z.infer<typeof quickTaskSchema>;
export type TagInput = z.infer<typeof tagSchema>;
