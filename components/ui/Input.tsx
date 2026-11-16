import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full h-10 px-3 bg-bg border border-border text-text placeholder:text-text-faint text-sm rounded-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50",
            error && "border-danger focus:border-danger",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : (
          helperText && <p className="mt-1 text-xs text-text-faint">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            "w-full h-10 px-3 bg-bg border border-border text-text text-sm rounded-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-50",
            error && "border-danger focus:border-danger",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
