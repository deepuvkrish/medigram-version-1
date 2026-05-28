"use client";

import { forwardRef } from "react";
import { MdEdit } from "react-icons/md";

// ============================================================
// Input — Reusable form input with label and error display.
// Uses forwardRef so react-hook-form can register it directly.
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  edit?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", edit = false, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 relative h-fit">
        <label className="text-sm font-medium text-white md:text-gray-700 md:dark:text-gray-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg text-sm  text-gray-100 md:text-gray-400 dark:md:text-gray-300  bg-[#242428] md:bg-[#f1f4fb] dark:md:bg-[#232428] placeholder-gray-400 md:dark:placeholder-gray-700
            transition-colors duration-150 focus:outline-none focus:ring-3 focus:ring-(--cornBlue) border focus:border-none  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:[&::-webkit-calendar-picker-indicator]:cursor-pointer dark:[&::-webkit-calendar-picker-indicator]:opacity-70  dark:[&::-webkit-calendar-picker-indicator]:invert
            ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-900 hover:border-(--cornBlue)"
            }
            ${className}
            ${edit ? "pr-10" : ""}
          `}
          {...props}
        />
        {edit && (
          <MdEdit className="absolute right-3 top-1/2 -translate-y-1/2" />
        )}

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
