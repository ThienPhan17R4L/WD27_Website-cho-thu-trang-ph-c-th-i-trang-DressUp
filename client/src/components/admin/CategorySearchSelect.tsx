import { useState, useRef, useEffect } from "react";
import type { Category } from "@/types/category";

type Props = {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
};

export default function CategorySearchSelect({
  categories,
  value,
  onChange,
  placeholder = "Chọn danh mục...",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = categories.find((c) => c._id === value);

  // Build tree: roots + children map
  const roots = categories.filter((c) => !c.parentId);
  const childrenByParent: Record<string, Category[]> = {};
  categories
    .filter((c) => !!c.parentId)
    .forEach((c) => {
      const pid = c.parentId!;
      if (!childrenByParent[pid]) childrenByParent[pid] = [];
      childrenByParent[pid].push(c);
    });

  // Filter by search
  const q = search.toLowerCase();
  const matchesRoot = (root: Category) =>
    !q || root.name.toLowerCase().includes(q);
  const matchesChild = (child: Category) =>
    !q || child.name.toLowerCase().includes(q);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setSearch("");
  }

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function renderOption(cat: Category, depth = 0) {
    return (
      <button
        key={cat._id}
        type="button"
        onClick={() => handleSelect(cat._id)}
        style={{ paddingLeft: 12 + depth * 16 }}
        className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
          cat._id === value ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
        }`}
      >
        {depth > 0 && (
          <span className="text-slate-300 text-xs">└</span>
        )}
        {cat.image && (
          <img src={cat.image} alt="" className="h-5 w-5 rounded object-cover flex-shrink-0" />
        )}
        <span className="truncate">{cat.name}</span>
        {!cat.parentId && childrenByParent[cat._id]?.length ? (
          <span className="ml-auto text-xs text-slate-400">
            {childrenByParent[cat._id].length}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
          aria-hidden
        />
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
          open ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200"
        }`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.name : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleSelect(""); }}
            className="text-slate-300 hover:text-slate-500 flex-shrink-0"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        {!value && (
          <svg className="h-4 w-4 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {/* Search */}
          <div className="border-b border-slate-100 p-2">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto py-1">
            {/* Clear option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full text-left px-3 py-2 text-sm italic hover:bg-slate-50 ${
                !value ? "bg-indigo-50 text-indigo-600" : "text-slate-400"
              }`}
            >
              — Không có (danh mục gốc) —
            </button>

            {roots.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-400">Không có danh mục</div>
            )}

            {roots
              .filter((r) => matchesRoot(r) || (childrenByParent[r._id] || []).some(matchesChild))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
              .map((root) => (
                <div key={root._id}>
                  {matchesRoot(root) && renderOption(root, 0)}
                  {(childrenByParent[root._id] || [])
                    .filter(matchesChild)
                    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                    .map((child) => renderOption(child, 1))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
