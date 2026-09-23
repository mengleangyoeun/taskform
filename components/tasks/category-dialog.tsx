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
import { Category } from "@/types/database";

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Category | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<void> | void;
}

function CategoryForm({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: Category | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<void> | void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [color, setColor] = useState(initialData?.color || "#3b82f6");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon: "folder",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Edit Category" : "Add Category"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="cat-name">Category Name *</Label>
          <Input
            id="cat-name"
            placeholder="e.g. WORK, PERSONAL, PROJECTS"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat-desc">Description (Optional)</Label>
          <Textarea
            id="cat-desc"
            placeholder="Brief description of this category"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Theme Color</Label>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform cursor-pointer flex items-center justify-center border-2 ${
                  color === c ? "scale-110 border-foreground shadow" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Save Changes" : "Create Category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <CategoryForm
            key={initialData?.id || "new-category"}
            initialData={initialData}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
