"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "both";
};

export function ScrollArea({
  className,
  children,
  orientation = "both",
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "w-full overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
        orientation === "vertical" && "overflow-x-hidden overflow-y-auto",
        orientation === "horizontal" && "overflow-y-hidden overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
