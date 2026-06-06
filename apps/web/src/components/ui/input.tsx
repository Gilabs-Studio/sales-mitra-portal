import * as React from "react";
import { cn } from "@/lib/utils";

const ignoredAutoSelectTypes = new Set(["date", "time", "color", "file"]);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onFocus, onKeyDown, ...props }, ref) => {
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (!ignoredAutoSelectTypes.has(type ?? "text")) {
        event.currentTarget.select();
      }
      onFocus?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === "number") {
        const allowed = [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ];
        const value = event.currentTarget.value;
        const key = event.key;
        const isNumber = /^[0-9]$/.test(key);
        const isDecimal = key === "." && !value.includes(".");
        const isMinus = key === "-" && value.length === 0;

        if (!allowed.includes(key) && !isNumber && !isDecimal && !isMinus) {
          event.preventDefault();
        }
      }
      onKeyDown?.(event);
    };

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
