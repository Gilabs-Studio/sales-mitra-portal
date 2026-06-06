"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type NumericInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: number | string;
  onChange?: (value: number) => void;
  /** Locale format. Defaults to "id-ID" (1.000.000) */
  locale?: string;
};

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, value, onChange, onFocus, onBlur, locale = "id-ID", ...props }, ref) => {
    const numericValue = value !== undefined && value !== "" ? Number(value) : undefined;

    // "display" = formatted string; "raw" = plain number string while editing
    const [isFocused, setIsFocused] = React.useState(false);
    const [rawInput, setRawInput] = React.useState<string>(
      numericValue !== undefined && !isNaN(numericValue) ? String(numericValue) : "",
    );

    // Keep rawInput in sync with external value when not focused
    React.useEffect(() => {
      if (!isFocused) {
        setRawInput(
          numericValue !== undefined && !isNaN(numericValue) ? String(numericValue) : "",
        );
      }
    }, [numericValue, isFocused]);

    const formattedDisplay =
      numericValue !== undefined && !isNaN(numericValue)
        ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(numericValue)
        : "";

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Select all text on focus
      requestAnimationFrame(() => e.currentTarget.select());
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const parsed = parseFloat(rawInput.replace(/[^\d.-]/g, ""));
      const finalValue = isNaN(parsed) ? 0 : parsed;
      setRawInput(String(finalValue));
      onChange?.(finalValue);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow only digits, one dot, one leading minus
      if (/^-?\d*\.?\d*$/.test(raw) || raw === "") {
        setRawInput(raw);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          onChange?.(parsed);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "Home", "End",
      ];
      const key = e.key;
      const value = e.currentTarget.value;
      const isDigit = /^[0-9]$/.test(key);
      const isDecimal = key === "." && !value.includes(".");
      if (!allowed.includes(key) && !isDigit && !isDecimal) {
        e.preventDefault();
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn(
          "min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
        value={isFocused ? rawInput : formattedDisplay}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

NumericInput.displayName = "NumericInput";
