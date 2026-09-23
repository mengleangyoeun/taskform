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

interface WorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id: string; name: string; description: string | null } | null;
  onSubmit: (name: string, description?: string) => Promise<void> | void;
}

function WorkspaceForm({
  initialData,
  onSubmit,
  onClose,
}: {
  initialData?: { id: string; name: string; description: string | null } | null;
  onSubmit: (name: string, description?: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    onSubmit(name.trim(), description.trim() || undefined);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Edit Workspace" : "Create New Workspace"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="ws-name">Workspace Name *</Label>
          <Input
            id="ws-name"
            placeholder="e.g. Work, Personal, University"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ws-desc">Description (Optional)</Label>
          <Textarea
            id="ws-desc"
            placeholder="What is this workspace used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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
          {initialData ? "Save Changes" : "Create Workspace"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function WorkspaceDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: WorkspaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <WorkspaceForm
            key={initialData?.id || "new-workspace"}
            initialData={initialData}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
