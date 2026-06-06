import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-card p-5 shadow-[0_2px_2px_rgba(0,0,0,0.01)]", className)}
      {...props}
    />
  );
}
