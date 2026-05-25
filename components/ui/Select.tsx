"use client";

import { forwardRef } from "react";

// ============================================================
// Select — Reusable dropdown. Used for specialty picker.
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = "", ...props },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <select
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            bg-white text-gray-900
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
