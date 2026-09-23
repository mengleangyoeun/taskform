import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground hover:bg-primary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border/60",
        urgent: "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400",
        high: "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        medium: "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        low: "border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
        completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        in_progress: "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        waiting: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        not_started: "border-border/60 bg-muted/50 text-muted-foreground",
        cancelled: "border-border/60 bg-muted/30 text-muted-foreground line-through",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
