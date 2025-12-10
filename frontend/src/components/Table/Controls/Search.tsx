'use client';

import type { Table } from '@tanstack/react-table';
import { SearchIcon, X } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group.tsx';
import { Kbd } from '@/components/ui/kbd.tsx';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: any;
}

export function Search<TData>({ table, globalFilter }: DataTableToolbarProps<TData>) {
  const isFiltered = globalFilter.length > 0;

  return (
    <InputGroup>
      <InputGroupInput
        value={globalFilter ?? ''}
        onChange={(e) => table.setGlobalFilter(String(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            table.setGlobalFilter('');
          }
        }}
        name="search"
        className="h-9 pl-6"
        placeholder="Search..."
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {isFiltered && (
        <InputGroupAddon align="inline-end" onClick={() => table.setGlobalFilter('')}>
          <InputGroupButton>
            <X className="mt-[1px]" /> <Kbd>Esc</Kbd>
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
