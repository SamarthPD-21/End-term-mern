"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  id?: string;
};

export default function CategorySelect({ value, onChange, options, placeholder, id }: Props) {
  const opts = options ?? [
    { value: "leather", label: "Leather" },
    { value: "copper", label: "Copper" },
    { value: "imitation-jewelry", label: "Imitation Jewelry" },
    { value: "handicrafts", label: "Handicrafts" },
    { value: "sustainable", label: "Sustainable" },
  ];

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, opts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex >= 0) choose(opts[focusedIndex].value);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, focusedIndex, opts]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const label = opts.find((o) => o.value === value)?.label || placeholder || "Select category";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left border px-3 py-2 rounded flex items-center justify-between"
      >
        <span className="truncate">{label}</span>
        <span className="ml-2 text-gray-400">▾</span>
      </button>
      {open && (
        <ul role="listbox" aria-labelledby={id} className="absolute z-50 w-full mt-1 bg-white border rounded shadow-sm max-h-48 overflow-auto">
          {opts.map((o, idx) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onClick={() => choose(o.value)}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`px-3 py-2 cursor-pointer ${idx === focusedIndex ? 'bg-gray-100' : ''} ${o.value === value ? 'bg-green-50' : ''}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
