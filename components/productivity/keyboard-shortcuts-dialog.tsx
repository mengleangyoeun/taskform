"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Command } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { key: "⌘K", description: "Open Command Palette (from anywhere)" },
  { key: "N", description: "Create a new task" },
  { key: "C", description: "Create a new category" },
  { key: "/", description: "Focus search bar" },
  { key: "S", description: "Focus search bar (when outside inputs)" },
  { key: "?", description: "Open keyboard shortcuts help" },
  { key: "Esc", description: "Close dialogs or clear focus" },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-3 py-3">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 border-border/40"
            >
              <span className="text-muted-foreground">{sc.description}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-muted border rounded shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
