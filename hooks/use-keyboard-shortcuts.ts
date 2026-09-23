"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onNewTask?: () => void;
  onNewCategory?: () => void;
  onFocusSearch?: () => void;
  onOpenHelp?: () => void;
  onOpenCommandPalette?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl+K works globally from anywhere
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        handlers.onOpenCommandPalette?.();
        return;
      }

      // Do not trigger single-key shortcuts if typing in an input, textarea, or contentEditable element
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true");

      if (e.key === "?" && !isInput) {
        e.preventDefault();
        handlers.onOpenHelp?.();
        return;
      }

      if (isInput) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handlers.onNewTask?.();
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        handlers.onNewCategory?.();
      } else if (e.key === "/" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handlers.onFocusSearch?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
