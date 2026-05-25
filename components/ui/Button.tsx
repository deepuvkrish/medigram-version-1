"use client";

// ============================================================
// Button — Reusable button with variants and loading state.
// Shows a spinner automatically when isLoading is true.
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2
    px-4 py-2 rounded-lg text-sm font-medium
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
  };

  return (
    <button
      className={`
        ${base}
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Spinner — shown when isLoading is true */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
