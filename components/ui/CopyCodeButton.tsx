//components/ui/CopyCodeButton.tsx

"use client";

import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";

// ============================================================
// CopyCodeButton — copies text to clipboard.
// Shows a tick confirmation for 2 seconds after copying.
// ============================================================

interface Props {
  code: string;
}

export default function CopyCodeButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = code;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        ml-2 flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium
        transition-all duration-200
        ${
          copied
            ? " text-green-700 dark:text-green-400"
            : "text-gray-200 md:text-gray-400 dark:text-blue-200/40 hover:text-(--cornBlue)"
        }
      `}
    >
      {copied ? (
        <>
          <CheckCheck className="mr-0.5 w-4 h-4" />
          <span className="hidden md:block">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="mr-0.5 w-4 h-4" />
          <span className="hidden md:block">Copy ID</span>
        </>
      )}
    </button>
  );
}
