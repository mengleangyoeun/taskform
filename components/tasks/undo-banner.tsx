"use client";

import { Button } from "@/components/ui/button";
import { Undo2, X } from "lucide-react";

interface UndoBannerProps {
  description: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoBanner({ description, onUndo, onDismiss }: UndoBannerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-foreground text-background px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
      <span className="text-sm font-medium">{description}</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={onUndo}
        className="h-7 text-xs font-semibold gap-1 text-foreground"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </Button>
      <button
        onClick={onDismiss}
        className="text-muted-foreground hover:text-background transition-colors p-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
