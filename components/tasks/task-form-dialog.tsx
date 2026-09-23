"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskPriority, TaskStatus, WorkspaceWithDetails } from "@/types/database";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: WorkspaceWithDetails | null;
  defaultSubcategoryId?: string;
  initialTask?: Task | null;
  onSubmit: (data: {
    id?: string;
    subcategoryId: string;
    title: string;
    description?: string | null;
    notes?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string | null;
    startDate?: string | null;
    estimatedMinutes?: number | null;
  }) => Promise<void> | void;
}

function TaskForm({
  workspace,
  defaultSubcategoryId,
  initialTask,
  onSubmit,
  onClose,
}: {
  workspace: WorkspaceWithDetails | null;
  defaultSubcategoryId?: string;
  initialTask?: Task | null;
  onSubmit: TaskFormDialogProps["onSubmit"];
  onClose: () => void;
}) {
  const subcategoryOptions = (workspace?.categories || []).flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      id: sub.id,
      name: `${cat.name} → ${sub.name}`,
    }))
  );

  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [notes, setNotes] = useState(initialTask?.notes || "");
  const [subcategoryId, setSubcategoryId] = useState(
    initialTask?.subcategory_id || defaultSubcategoryId || subcategoryOptions[0]?.id || ""
  );
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || "not_started");
  const [dueDate, setDueDate] = useState(
    initialTask?.due_date ? initialTask.due_date.split("T")[0] : ""
  );
  const [startDate, setStartDate] = useState(
    initialTask?.start_date ? initialTask.start_date.split("T")[0] : ""
  );
  const [estimatedHours, setEstimatedHours] = useState(
    initialTask?.estimated_minutes ? (initialTask.estimated_minutes / 60).toString() : ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!subcategoryId) {
      setError("Please select a category / subcategory");
      return;
    }

    const estMinutes = estimatedHours ? Math.round(parseFloat(estimatedHours) * 60) : null;

    onSubmit({
      id: initialTask?.id,
      subcategoryId,
      title: title.trim(),
      description: description.trim() || null,
      notes: notes.trim() || null,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      estimatedMinutes: estMinutes,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{initialTask ? "Edit Task" : "Create New Task"}</DialogTitle>
      </DialogHeader>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title *</Label>
        <Input
          id="task-title"
          placeholder="e.g. Build homepage wireframe"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-subcat">Category & Subcategory *</Label>
        <Select value={subcategoryId} onValueChange={setSubcategoryId}>
          <SelectTrigger id="task-subcat">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategoryOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
            <SelectTrigger id="task-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
            <SelectTrigger id="task-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-start">Start Date</Label>
          <Input
            id="task-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due">Due Date</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-est">Est. Time (Hours)</Label>
          <Input
            id="task-est"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g. 2.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc">Description</Label>
        <Textarea
          id="task-desc"
          placeholder="What needs to be accomplished?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-notes">Additional Notes</Label>
        <Textarea
          id="task-notes"
          placeholder="Guidelines, references, links, checklist hints..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{initialTask ? "Save Changes" : "Create Task"}</Button>
      </DialogFooter>
    </form>
  );
}

export function TaskFormDialog({
  open,
  onOpenChange,
  workspace,
  defaultSubcategoryId,
  initialTask,
  onSubmit,
}: TaskFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        {open && (
          <TaskForm
            key={initialTask?.id || defaultSubcategoryId || "new-task"}
            workspace={workspace}
            defaultSubcategoryId={defaultSubcategoryId}
            initialTask={initialTask}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
