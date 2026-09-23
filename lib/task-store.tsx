"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  WorkspaceWithDetails,
  CategoryWithSubcategories,
  SubcategoryWithTasks,
  TaskWithSubtasks,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/types/database";
import { initialWorkspaces } from "@/lib/default-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  waitingTasks: number;
  notStartedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}

interface UndoItem {
  type: "delete_task" | "delete_category" | "delete_subcategory";
  description: string;
  restore: () => void;
}

interface TaskContextType {
  workspaces: WorkspaceWithDetails[];
  activeWorkspaceId: string;
  activeWorkspace: WorkspaceWithDetails | null;
  saveStatus: "saved" | "saving" | "error";
  lastUndo: UndoItem | null;
  autoCompleteParentOnSubtasks: boolean;
  stats: TaskStats;
  setActiveWorkspaceId: (id: string) => void;
  setAutoCompleteParentOnSubtasks: (enabled: boolean) => void;
  undo: () => void;
  clearUndo: () => void;
  // Workspace CRUD
  createWorkspace: (name: string, description?: string) => Promise<string>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  importWorkspace: (imported: WorkspaceWithDetails) => void;
  // Category CRUD
  createCategory: (data: { name: string; description?: string; color?: string; icon?: string }) => Promise<void>;
  updateCategory: (id: string, data: { name?: string; description?: string; color?: string; icon?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Subcategory CRUD
  createSubcategory: (categoryId: string, data: { name: string; description?: string }) => Promise<void>;
  updateSubcategory: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  // Task CRUD
  createTask: (data: {
    subcategoryId: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    startDate?: string | null;
    estimatedMinutes?: number | null;
  }) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Task Reordering & Drag-and-Drop
  reorderTasks: (subcategoryId: string, activeTaskId: string, targetTaskId: string) => Promise<void>;
  // Batch Actions
  batchToggleComplete: (taskIds: string[], complete: boolean) => Promise<void>;
  batchUpdatePriority: (taskIds: string[], priority: TaskPriority) => Promise<void>;
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<void>;
  batchDeleteTasks: (taskIds: string[]) => Promise<void>;
  // Subtask CRUD
  createSubtask: (parentTaskId: string, subcategoryId: string, title: string) => Promise<void>;
  toggleSubtaskComplete: (subtaskId: string, parentTaskId: string) => Promise<void>;
  deleteSubtask: (subtaskId: string, parentTaskId: string) => Promise<void>;
  // Auth & Cloud Sync
  currentUser: { id: string; email?: string } | null;
  isCloudConnected: boolean;
  signOut: () => Promise<void>;
  isHydrated: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = "taskform_workspaces_v1";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with default data on both server and client to guarantee 100% matched initial render
  const [workspaces, setWorkspaces] = useState<WorkspaceWithDetails[]>(initialWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("ws-1");
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [lastUndo, setLastUndo] = useState<UndoItem | null>(null);
  const [autoCompleteParentOnSubtasks, setAutoCompleteParentOnSubtasks] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // Safely hydrate from localStorage on client after initial paint
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkspaces(parsed);
            const savedActiveWs = localStorage.getItem("taskform_active_ws");
            if (savedActiveWs && parsed.some((w: WorkspaceWithDetails) => w.id === savedActiveWs)) {
              setActiveWorkspaceId(savedActiveWs);
            } else {
              setActiveWorkspaceId(parsed[0].id);
            }
          }
        }
      } catch {
        // fallback to initialWorkspaces
      }
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save activeWorkspaceId to localStorage once hydrated
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("taskform_active_ws", activeWorkspaceId);
    } catch {
      // ignore
    }
  }, [activeWorkspaceId, isHydrated]);

  // Check Supabase session if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            setCurrentUser({ id: user.id, email: user.email });
            setIsCloudConnected(true);
          }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setCurrentUser({ id: session.user.id, email: session.user.email });
            setIsCloudConnected(true);
          } else {
            setCurrentUser(null);
            setIsCloudConnected(false);
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Supabase auth check failed:", err);
      }
    }
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        setCurrentUser(null);
        setIsCloudConnected(false);
      } catch (err) {
        console.warn("Sign out failed:", err);
      }
    }
  };

  // Sync to local storage only after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [workspaces, isHydrated]);

  const activeWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  // Statistics calculation for active workspace
  const stats = useMemo<TaskStats>(() => {
    if (!activeWorkspace) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        waitingTasks: 0,
        notStartedTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0,
      };
    }

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let waiting = 0;
    let notStarted = 0;
    let overdue = 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const cat of activeWorkspace.categories) {
      for (const sub of cat.subcategories) {
        for (const task of sub.tasks) {
          total++;
          if (task.status === "completed") {
            completed++;
          } else {
            if (task.status === "in_progress") inProgress++;
            else if (task.status === "waiting") waiting++;
            else notStarted++;

            if (task.due_date) {
              const due = new Date(task.due_date);
              if (!isNaN(due.getTime()) && due < now) {
                overdue++;
              }
            }
          }
        }
      }
    }

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      waitingTasks: waiting,
      notStartedTasks: notStarted,
      overdueTasks: overdue,
      completionPercentage,
    };
  }, [activeWorkspace]);

  const clearUndo = useCallback(() => setLastUndo(null), []);
  const undo = useCallback(() => {
    if (lastUndo) {
      lastUndo.restore();
      setLastUndo(null);
    }
  }, [lastUndo]);

  // Auto-dismiss undo after 8 seconds
  useEffect(() => {
    if (lastUndo) {
      const timer = setTimeout(() => {
        setLastUndo(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastUndo]);

  // Workspaces
  const createWorkspace = async (name: string, description?: string): Promise<string> => {
    const newWs: WorkspaceWithDetails = {
      id: "ws-" + Date.now(),
      user_id: "demo-user",
      name,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: [],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    return newWs.id;
  };

  const updateWorkspace = async (id: string, name: string, description?: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              name,
              description: description || null,
              updated_at: new Date().toISOString(),
            }
          : w
      )
    );
  };

  const deleteWorkspace = async (id: string) => {
    const target = workspaces.find((w) => w.id === id);
    if (!target) return;

    setLastUndo({
      type: "delete_task",
      description: `Workspace "${target.name}" deleted`,
      restore: () => {
        setWorkspaces((prev) => [...prev, target]);
        setActiveWorkspaceId(target.id);
      },
    });

    setWorkspaces((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      if (activeWorkspaceId === id && filtered.length > 0) {
        setActiveWorkspaceId(filtered[0].id);
      }
      return filtered;
    });
  };

  const importWorkspace = (imported: WorkspaceWithDetails) => {
    setWorkspaces((prev) => [...prev, imported]);
    setActiveWorkspaceId(imported.id);
  };

  // Categories
  const createCategory = async (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => {
    const newCat: CategoryWithSubcategories = {
      id: "cat-" + Date.now(),
      workspace_id: activeWorkspaceId,
      name: data.name,
      description: data.description || null,
      color: data.color || "#3b82f6",
      icon: data.icon || "folder",
      sort_order: (activeWorkspace?.categories.length || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subcategories: [],
    };

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId
          ? { ...w, categories: [...w.categories, newCat], updated_at: new Date().toISOString() }
          : w
      )
    );
  };

  const updateCategory = async (
    id: string,
    data: { name?: string; description?: string; color?: string; icon?: string }
  ) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) =>
          c.id === id
            ? {
                ...c,
                ...data,
                updated_at: new Date().toISOString(),
              }
            : c
        ),
      }))
    );
  };

  const deleteCategory = async (id: string) => {
    let deletedCat: CategoryWithSubcategories | undefined;
    let parentWsId = "";

    for (const w of workspaces) {
      const found = w.categories.find((c) => c.id === id);
      if (found) {
        deletedCat = found;
        parentWsId = w.id;
        break;
      }
    }

    if (!deletedCat) return;
    const savedCat = deletedCat;
    const wsId = parentWsId;

    setLastUndo({
      type: "delete_category",
      description: `Category "${savedCat.name}" deleted`,
      restore: () => {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === wsId ? { ...w, categories: [...w.categories, savedCat] } : w
          )
        );
      },
    });

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.filter((c) => c.id !== id),
      }))
    );
  };

  // Subcategories
  const createSubcategory = async (
    categoryId: string,
    data: { name: string; description?: string }
  ) => {
    const newSub: SubcategoryWithTasks = {
      id: "sub-" + Date.now(),
      category_id: categoryId,
      name: data.name,
      description: data.description || null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [],
    };

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subcategories: [...c.subcategories, { ...newSub, sort_order: c.subcategories.length }],
              }
            : c
        ),
      }))
    );
  };

  const updateSubcategory = async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) =>
            s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
          ),
        })),
      }))
    );
  };

  const deleteSubcategory = async (id: string) => {
    let deletedSub: SubcategoryWithTasks | undefined;
    let targetCatId = "";

    for (const w of workspaces) {
      for (const c of w.categories) {
        const found = c.subcategories.find((s) => s.id === id);
        if (found) {
          deletedSub = found;
          targetCatId = c.id;
          break;
        }
      }
      if (deletedSub) break;
    }

    if (!deletedSub) return;
    const savedSub = deletedSub;
    const catId = targetCatId;

    setLastUndo({
      type: "delete_subcategory",
      description: `Subcategory "${savedSub.name}" deleted`,
      restore: () => {
        setWorkspaces((prev) =>
          prev.map((w) => ({
            ...w,
            categories: w.categories.map((c) =>
              c.id === catId ? { ...c, subcategories: [...c.subcategories, savedSub] } : c
            ),
          }))
        );
      },
    });

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.filter((s) => s.id !== id),
        })),
      }))
    );
  };

  // Tasks
  const createTask = async (data: {
    subcategoryId: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    startDate?: string | null;
    estimatedMinutes?: number | null;
  }) => {
    const newTask: TaskWithSubtasks = {
      id: "task-" + Date.now(),
      subcategory_id: data.subcategoryId,
      parent_task_id: null,
      title: data.title,
      description: data.description || null,
      notes: data.notes || null,
      priority: data.priority || "medium",
      status: data.status || "not_started",
      due_date: data.dueDate || null,
      start_date: data.startDate || null,
      estimated_minutes: data.estimatedMinutes || null,
      actual_minutes: null,
      completed_at: data.status === "completed" ? new Date().toISOString() : null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [],
    };

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) =>
            s.id === data.subcategoryId
              ? { ...s, tasks: [...s.tasks, { ...newTask, sort_order: s.tasks.length }] }
              : s
          ),
        })),
      }))
    );
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...data,
                    updated_at: new Date().toISOString(),
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  const toggleTaskComplete = async (id: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) => {
              if (t.id === id) {
                const isNowCompleted = t.status !== "completed";
                return {
                  ...t,
                  status: isNowCompleted ? "completed" : "not_started",
                  completed_at: isNowCompleted ? new Date().toISOString() : null,
                  updated_at: new Date().toISOString(),
                };
              }
              return t;
            }),
          })),
        })),
      }))
    );
  };

  const deleteTask = async (id: string) => {
    let deletedTask: TaskWithSubtasks | undefined;
    let targetSubId = "";

    for (const w of workspaces) {
      for (const c of w.categories) {
        for (const s of c.subcategories) {
          const found = s.tasks.find((t) => t.id === id);
          if (found) {
            deletedTask = found;
            targetSubId = s.id;
            break;
          }
        }
        if (deletedTask) break;
      }
      if (deletedTask) break;
    }

    if (!deletedTask) return;
    const savedTask = deletedTask;
    const subId = targetSubId;

    setLastUndo({
      type: "delete_task",
      description: `Task "${savedTask.title}" deleted`,
      restore: () => {
        setWorkspaces((prev) =>
          prev.map((w) => ({
            ...w,
            categories: w.categories.map((c) => ({
              ...c,
              subcategories: c.subcategories.map((s) =>
                s.id === subId ? { ...s, tasks: [...s.tasks, savedTask] } : s
              ),
            })),
          }))
        );
      },
    });

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.filter((t) => t.id !== id),
          })),
        })),
      }))
    );
  };

  // Task Reordering
  const reorderTasks = async (
    subcategoryId: string,
    activeTaskId: string,
    targetTaskId: string
  ) => {
    if (activeTaskId === targetTaskId) return;

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => {
            if (s.id !== subcategoryId) return s;
            const tasks = [...s.tasks];
            const oldIndex = tasks.findIndex((t) => t.id === activeTaskId);
            const newIndex = tasks.findIndex((t) => t.id === targetTaskId);
            if (oldIndex === -1 || newIndex === -1) return s;

            const [moved] = tasks.splice(oldIndex, 1);
            tasks.splice(newIndex, 0, moved);

            const reindexed = tasks.map((t, idx) => ({
              ...t,
              sort_order: idx,
            }));

            return {
              ...s,
              tasks: reindexed,
              updated_at: new Date().toISOString(),
            };
          }),
        })),
      }))
    );
  };

  // Batch Actions
  const batchToggleComplete = async (taskIds: string[], complete: boolean) => {
    if (!taskIds.length) return;
    const now = new Date().toISOString();
    const idSet = new Set(taskIds);

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              idSet.has(t.id)
                ? {
                    ...t,
                    status: (complete ? "completed" : "not_started") as TaskStatus,
                    completed_at: complete ? now : null,
                    updated_at: now,
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  const batchUpdatePriority = async (taskIds: string[], priority: TaskPriority) => {
    if (!taskIds.length) return;
    const now = new Date().toISOString();
    const idSet = new Set(taskIds);

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              idSet.has(t.id)
                ? {
                    ...t,
                    priority,
                    updated_at: now,
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  const batchUpdateStatus = async (taskIds: string[], status: TaskStatus) => {
    if (!taskIds.length) return;
    const now = new Date().toISOString();
    const idSet = new Set(taskIds);

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              idSet.has(t.id)
                ? {
                    ...t,
                    status,
                    completed_at: status === "completed" ? now : null,
                    updated_at: now,
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  const batchDeleteTasks = async (taskIds: string[]) => {
    if (!taskIds.length) return;
    const idSet = new Set(taskIds);

    const tasksToRestore: { task: TaskWithSubtasks; subcategoryId: string }[] = [];
    for (const w of workspaces) {
      for (const c of w.categories) {
        for (const s of c.subcategories) {
          for (const t of s.tasks) {
            if (idSet.has(t.id)) {
              tasksToRestore.push({ task: t, subcategoryId: s.id });
            }
          }
        }
      }
    }

    setLastUndo({
      type: "delete_task",
      description: `${taskIds.length} tasks deleted`,
      restore: () => {
        setWorkspaces((prev) =>
          prev.map((w) => ({
            ...w,
            categories: w.categories.map((c) => ({
              ...c,
              subcategories: c.subcategories.map((s) => {
                const matches = tasksToRestore.filter((r) => r.subcategoryId === s.id);
                if (matches.length > 0) {
                  return {
                    ...s,
                    tasks: [...s.tasks, ...matches.map((m) => m.task)],
                  };
                }
                return s;
              }),
            })),
          }))
        );
      },
    });

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.filter((t) => !idSet.has(t.id)),
          })),
        })),
      }))
    );
  };

  // Subtasks
  const createSubtask = async (
    parentTaskId: string,
    subcategoryId: string,
    title: string
  ) => {
    const newSubtask: Task = {
      id: "subtask-" + Date.now(),
      subcategory_id: subcategoryId,
      parent_task_id: parentTaskId,
      title,
      description: null,
      notes: null,
      priority: "medium",
      status: "not_started",
      due_date: null,
      start_date: null,
      estimated_minutes: null,
      actual_minutes: null,
      completed_at: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === parentTaskId
                ? {
                    ...t,
                    subtasks: [...t.subtasks, { ...newSubtask, sort_order: t.subtasks.length }],
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  const toggleSubtaskComplete = async (subtaskId: string, parentTaskId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) => {
              if (t.id === parentTaskId) {
                const updatedSubtasks = t.subtasks.map((st) => {
                  if (st.id === subtaskId) {
                    const isCompleted = st.status !== "completed";
                    return {
                      ...st,
                      status: (isCompleted ? "completed" : "not_started") as TaskStatus,
                      completed_at: isCompleted ? new Date().toISOString() : null,
                    };
                  }
                  return st;
                });

                // Check auto-completion of parent task
                let parentStatus = t.status;
                let completedAt = t.completed_at;
                if (autoCompleteParentOnSubtasks && updatedSubtasks.length > 0) {
                  const allDone = updatedSubtasks.every((st) => st.status === "completed");
                  if (allDone) {
                    parentStatus = "completed";
                    completedAt = new Date().toISOString();
                  } else if (parentStatus === "completed") {
                    parentStatus = "in_progress";
                    completedAt = null;
                  }
                }

                return {
                  ...t,
                  status: parentStatus,
                  completed_at: completedAt,
                  subtasks: updatedSubtasks,
                };
              }
              return t;
            }),
          })),
        })),
      }))
    );
  };

  const deleteSubtask = async (subtaskId: string, parentTaskId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        categories: w.categories.map((c) => ({
          ...c,
          subcategories: c.subcategories.map((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === parentTaskId
                ? {
                    ...t,
                    subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
                  }
                : t
            ),
          })),
        })),
      }))
    );
  };

  return (
    <TaskContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        saveStatus,
        lastUndo,
        autoCompleteParentOnSubtasks,
        stats,
        setActiveWorkspaceId,
        setAutoCompleteParentOnSubtasks,
        undo,
        clearUndo,
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
        currentUser,
        isCloudConnected,
        signOut,
        isHydrated,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
