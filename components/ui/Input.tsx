"use client";

import { forwardRef } from "react";

// ============================================================
// Input — Reusable form input with label and error display.
// Uses forwardRef so react-hook-form can register it directly.
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-white md:text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            bg-white text-gray-900 placeholder-gray-400
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-gray-400"
            }
            ${className}
          `}
          {...props}
        />

        {/* Error message — shown when validation fails */}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}

        {/* Hint text — shown when no error */}
        {hint && !error && (
          <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
