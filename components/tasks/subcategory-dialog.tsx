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
import { Subcategory } from "@/types/database";

interface SubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName?: string;
  initialData?: Subcategory | null;
  onSubmit: (data: { name: string; description?: string }) => Promise<void> | void;
}

function SubcategoryForm({
  categoryName,
  initialData,
  onSubmit,
  onClose,
}: {
  categoryName?: string;
  initialData?: Subcategory | null;
  onSubmit: (data: { name: string; description?: string }) => Promise<void> | void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Subcategory name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Edit Subcategory" : "Add Subcategory"}
        </DialogTitle>
        {categoryName && (
          <p className="text-xs text-muted-foreground">
            Inside Category: <strong>{categoryName}</strong>
          </p>
        )}
      </DialogHeader>
      <div className="space-y-4 py-4">
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="sub-name">Subcategory Name *</Label>
          <Input
            id="sub-name"
            placeholder="e.g. Web Development, Client Deliverables"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sub-desc">Description (Optional)</Label>
          <Textarea
            id="sub-desc"
            placeholder="Brief description of this subcategory"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
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
          {initialData ? "Save Changes" : "Create Subcategory"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SubcategoryDialog({
  open,
  onOpenChange,
  categoryName,
  initialData,
  onSubmit,
}: SubcategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <SubcategoryForm
            key={initialData?.id || "new-subcategory"}
            categoryName={categoryName}
            initialData={initialData}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
