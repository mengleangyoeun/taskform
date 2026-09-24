"use client";

import Link from "next/link";
import { CheckSquare, Moon, Sun, LogIn, LogOut, Command, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";
import { useTasks } from "@/lib/task-store";

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function useSafeTasks() {
  try {
    return useTasks();
  } catch {
    return null;
  }
}

export function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const taskStore = useSafeTasks();
  const currentUser = taskStore?.currentUser;

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const willBeDark = !root.classList.contains("dark");
      if (willBeDark) {
        root.classList.add("dark");
        try {
          localStorage.setItem("theme", "dark");
        } catch {}
      } else {
        root.classList.remove("dark");
        try {
          localStorage.setItem("theme", "light");
        } catch {}
      }
    }
  };

  return (
    <header className="border-b border-border/30 bg-background/75 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-medium text-sm tracking-tight text-foreground">
          <div className="h-5 w-5 rounded bg-foreground text-background flex items-center justify-center font-bold">
            <CheckSquare className="h-3 w-3" />
          </div>
          <span className="font-semibold tracking-tight">TaskForm</span>
        </Link>

        {/* Right Actions: Search / Theme / Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global Search Hotkey Badge */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCommandPalette) {
                onOpenCommandPalette();
              } else if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }
            }}
            className="flex items-center gap-1.5 p-1.5 sm:px-2 sm:py-1 text-xs text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 rounded-md border border-border/40 transition-colors cursor-pointer"
            title="Search or execute commands (⌘K)"
          >
            <Command className="h-3.5 w-3.5 sm:h-3 sm:w-3 opacity-70" />
            <span className="text-[11px] font-sans text-muted-foreground/80 hidden sm:inline">Search</span>
            <kbd className="font-mono text-[10px] bg-background/80 px-1 rounded border border-border/40 ml-1 hidden sm:inline">⌘K</kbd>
          </button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          {/* Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 ml-1">
              <div
                className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs text-muted-foreground max-w-[130px] truncate"
                title={currentUser.email}
              >
                <UserIcon className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate text-[11px]">{currentUser.email?.split("@")[0]}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => taskStore?.signOut()}
                className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-destructive"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground font-medium">
              <Link href="/login">
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
