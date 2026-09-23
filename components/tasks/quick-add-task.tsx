"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuickAddTaskProps {
  subcategoryId: string;
  onAdd: (data: { subcategoryId: string; title: string }) => Promise<void> | void;
  placeholder?: string;
}

export function QuickAddTask({
  subcategoryId,
  onAdd,
  placeholder = "+ Add task...",
}: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ subcategoryId, title: title.trim() });
    setTitle("");
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-start gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground h-7 px-2.5 border border-dashed border-border/40 hover:border-border/80 rounded-md transition-colors mt-1.5 cursor-pointer bg-muted/10 hover:bg-muted/20"
      >
        <Plus className="h-3 w-3" />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 mt-1.5">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title (Enter to save, Esc to cancel)"
        className="h-7 text-xs bg-background/80 border-border/60"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
            setTitle("");
          }
        }}
      />
      <Button type="submit" size="xs" className="h-7 px-2.5 text-xs" disabled={!title.trim()}>
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => {
          setIsOpen(false);
          setTitle("");
        }}
      >
        Cancel
      </Button>
    </form>
  );
}
