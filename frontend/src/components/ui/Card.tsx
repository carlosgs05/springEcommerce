import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  elevation?: 1 | 2 | 3;
  as?: "div" | "article" | "section";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const elevations = {
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
} as const;

// Menos padding en móvil
const paddings = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-5 sm:p-8",
} as const;

const hoverElevations = {
  1: "hover:shadow-elevation-2",
  2: "hover:shadow-elevation-3",
  3: "hover:shadow-elevation-3",
} as const;

export function Card({
  elevation = 1,
  as: Tag = "div",
  padding = "md",
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <Tag
      data-ui
      className={cn(
        "rounded-card border border-border bg-surface text-text",
        elevations[elevation],
        paddings[padding],
        interactive &&
          cn(
            "transition-[box-shadow,transform] duration-[var(--duration-base)] ease-standard hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            hoverElevations[elevation],
          ),
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex flex-col gap-1", className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-text-muted dark:text-slate-400", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4", className)}
      {...rest}
    />
  );
}
