"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearchNotes } from "@/lib/api";
import { cn } from "@workspace/ui/lib/utils";
import type { Note } from "@/lib/api";
import { Input } from "@workspace/ui/components/input";
import { Kbd } from "@workspace/ui/components/kbd";

interface SearchBarProps {
  onSelectNote: (id: string) => void;
  className?: string;
}

export const SearchBar = React.memo(function SearchBar({
  onSelectNote,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useSearchNotes(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="bg-background! w-full rounded-md pl-9 pr-20"
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!query && (
          <Kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 transform md:inline-flex">
            <span>⌘</span>
            <span>K</span>
          </Kbd>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="border-border bg-popover absolute left-0 right-0 top-full z-50 mt-1 max-h-[300px] overflow-y-auto rounded-md border shadow-lg">
          {isLoading && (
            <div className="flex items-center justify-center px-4 py-6">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="text-muted-foreground px-4 py-6 text-center text-sm">
              No notes found
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="divide-y">
              {results.map((note: Note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className="hover:bg-accent focus:bg-accent w-full cursor-pointer px-3 py-2 text-left transition-colors focus:outline-none"
                >
                  <div className="flex flex-col gap-0.5">
                    <h4 className="line-clamp-1 text-sm font-medium">
                      {note.title}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
