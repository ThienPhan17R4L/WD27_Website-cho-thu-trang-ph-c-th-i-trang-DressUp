import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTagSuggestions } from "@/api/products.api";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["tag-suggestions", input],
    queryFn: () => getTagSuggestions(input),
    enabled: input.length > 0,
  });

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.map(t => t.toLowerCase()).includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    }
  };

  return (
    <div className="relative">
      {/* Tag pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2 py-1 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="hover:bg-rose-200 rounded-full p-0.5 transition-colors"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowDropdown(e.target.value.length > 0);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onFocus={() => {
          if (input.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
        className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {/* Suggestions dropdown */}
      {showDropdown && suggestions?.tags && suggestions.tags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto z-10">
          {suggestions.tags.map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => addTag(tag)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
