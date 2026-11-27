"use client";

import { useEffect, useRef, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useSearch } from "@/lib/api/queries";
import { PAGES, humanize, pageByKey } from "@/lib/modules";
import { useGo } from "@/lib/navigation";
import { useUI } from "@/lib/stores/ui";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * Global search: a cmdk combobox in the top bar. Results (sections, records, people) open in a
 * popover listbox; arrow keys move, Enter picks, Escape closes. ⌘K / Ctrl+K focuses it.
 */
export function TopSearch({ query, onQueryChange }: { query: string; onQueryChange: (q: string) => void }) {
  const go = useGo();
  const openRecord = useUI((s) => s.openRecord);
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const q = query.trim();
  const debounced = useDebounced(q, 350);
  const res = useSearch(debounced);
  const sections = q ? PAGES.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : [];
  const show = open && q.length >= 2;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = (fn: () => void) => () => {
    fn();
    onQueryChange("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <Popover open={show} onOpenChange={setOpen}>
      {/* `contents`: the cmdk root only provides keyboard handling; the input group is the visible box. */}
      <Command shouldFilter={false} className="contents" label="Global search">
        <PopoverAnchor asChild>
          <InputGroup ref={anchorRef} className="top-search">
            <InputGroupAddon>
              <Search size={18} aria-hidden="true" />
            </InputGroupAddon>
            <CommandPrimitive.Input
              ref={inputRef}
              data-slot="input-group-control"
              className="h-full min-w-0 flex-1 bg-transparent text-[13px] outline-hidden placeholder:text-muted-foreground"
              value={query}
              onValueChange={(v) => {
                onQueryChange(v);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search people, organizations, transactions or cases"
            />
            <InputGroupAddon align="inline-end" className="hidden sm:flex">
              <Kbd>⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="search-popover w-(--radix-popover-trigger-width) min-w-[320px] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
          }}
        >
          <CommandList>
            {sections.length > 0 && (
              <CommandGroup heading="Sections">
                {sections.map((m) => (
                  <CommandItem key={m.slug} value={`section:${m.slug}`} onSelect={pick(() => go(m.slug))}>
                    <span>{m.name}</span>
                    <small>Section</small>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!!res.data?.records.length && (
              <CommandGroup heading="Records">
                {res.data.records.map((r) => (
                  <CommandItem key={r._id} value={`record:${r._id}`} onSelect={pick(() => openRecord(r))}>
                    <span>
                      <b>{r.reference}</b> · {r.title}
                    </span>
                    <small>{pageByKey(r.module)?.name ?? humanize(r.module)}</small>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!!res.data?.people.length && (
              <CommandGroup heading="People">
                {res.data.people.map((p) => (
                  <CommandItem key={p._id} value={`person:${p._id}`} onSelect={pick(() => go("viewAsUser"))}>
                    <span>
                      <b>{p.fullName}</b> · {p.email || p.mobileNumber}
                    </span>
                    <small>{humanize(p.userType.toLowerCase())}</small>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {res.isFetching || debounced !== q ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground" role="status">
                <Spinner /> Searching…
              </div>
            ) : res.error ? (
              <div className="px-3 py-3 text-sm text-destructive" role="alert">
                {res.error.message}
              </div>
            ) : (
              <CommandEmpty>No matching sections, people or records.</CommandEmpty>
            )}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
