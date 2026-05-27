//components/ui/QualificationsInput.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { QUALIFICATIONS } from "@/lib/constants";

// ============================================================
// QualificationsInput — autocomplete tag input.
// Doctor types → sees filtered suggestions → picks one →
// it appears as a removable tag. Fully keyboard navigable.
// ============================================================

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function QualificationsInput({ value, onChange, error }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const filtered = QUALIFICATIONS.filter(
      (qual) => qual.toLowerCase().includes(q) && !value.includes(qual),
      // Exclude already selected qualifications
    ).slice(0, 8); // Show max 8 suggestions

    setSuggestions(filtered);
    setOpen(filtered.length > 0);
    setActiveIndex(-1);
  }, [query, value]);

  const addQualification = (qual: string) => {
    if (!value.includes(qual)) {
      onChange([...value, qual]);
    }
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeQualification = (qual: string) => {
    onChange(value.filter((q) => q !== qual));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        addQualification(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        Qualifications
        <span className="text-xs text-gray-400 font-normal ml-2">
          Type to search and add
        </span>
      </label>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {value.map((qual) => (
            <span
              key={qual}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                         bg-blue-50 text-blue-700 text-xs font-medium"
            >
              {qual}
              <button
                type="button"
                onClick={() => removeQualification(qual)}
                className="ml-0.5 text-blue-400 hover:text-blue-700
                           transition-colors rounded-full"
                aria-label={`Remove ${qual}`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => query && setSuggestions.length > 0 && setOpen(true)}
          placeholder="e.g. M.B.B.S, M.D (Cardiology)..."
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            bg-white text-gray-900 placeholder-gray-400
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-gray-400"
            }
          `}
        />

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <ul
            ref={listRef}
            className="absolute bottom-full left-0 right-0 mb-1 z-50
                       bg-white border border-gray-200 rounded-lg shadow-lg
                       max-h-52 overflow-y-auto"
            // bottom-full = popup appears ABOVE the input
          >
            {suggestions.map((qual, index) => (
              <li key={qual}>
                <button
                  type="button"
                  onMouseDown={() => addQualification(qual)}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors
                    ${
                      index === activeIndex
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {highlightMatch(qual, query)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}

      {value.length === 0 && !query && (
        <p className="text-xs text-gray-400">
          Start typing to see suggestions. You can add multiple qualifications.
        </p>
      )}
    </div>
  );
}

// Highlight the matching part of the suggestion text
function highlightMatch(text: string, query: string) {
  if (!query) return <span>{text}</span>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, index)}
      <span className="font-semibold text-blue-600">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </span>
  );
}
