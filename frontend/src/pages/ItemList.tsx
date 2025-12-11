'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { StoreContext } from '@/store/storeContext.ts';
import { Search } from '../components/Table/Controls/Search.tsx';
import { observer } from 'mobx-react-lite';
import { Sorter } from '../components/Table/Controls/Sorter.tsx';
import { Pagination } from '../components/Table/Controls/Pagination.tsx';
import { CardsLayout } from '../components/Table/Layouts/CardsLayout.tsx';
import { PreviewImage } from '@/components/Table/Fields/PreviewImage.tsx';
import { ActionType, ItemType, LayoutType } from '@/lib/types.ts';
import { ItemsActions } from '@/components/Table/Fields/ItemActions.tsx';
import {
  getSavedLayoutColumnVisibilityPreference,
  getSavedLayoutPreference,
  saveLayoutColumnVisibilityPreference,
  saveLayoutPreference,
} from '@/lib/utils.ts';
import { TableLayout } from '@/components/Table/Layouts/TableLayout.tsx';
import { FieldToggler } from '@/components/Table/Controls/FieldToggler.tsx';
import { TagBadge } from '@/components/Table/Fields/TagBadge.tsx';
import { ListLayout } from '@/components/Table/Layouts/ListLayout.tsx';
import { LayoutSelector } from '@/components/Table/Controls/LayoutSelector.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PlusIcon, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Dashboard } from '@/layouts/Dashboard.tsx';

const columns: ColumnDef<ItemType>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => {
      const imageURL = row.getValue('image') as string;
      return imageURL && <PreviewImage imageUrl={imageURL} className="" />;
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
    cell: ({ row }) => {
      return (
        <span
          // className="line-clamp-3 scroll-m-20 text-xl font-semibold tracking-tight"
          title={row.getValue('title')}
        >
          {row.getValue('title')}
        </span>
      );
    },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs break-all\n' },
    cell: ({ row }) => {
      return (
        <a className="underline" href={row.getValue('url')} target="_blank" rel="noopener noreferrer">
          {row.getValue('url')}
        </a>
      );
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    enableSorting: false,
    enableHiding: true,
    meta: { class: 'min-w-xs' },

    filterFn: (row, columnId, filterValue) => {
      if (filterValue === '0') {
        return true;
      }
      const tags = row.getValue('tags') as number[];
      if (filterValue === null && tags.length === 0) {
        return true;
      }

      return tags.includes(Number(filterValue) as unknown as number);
    },
    cell: ({ row }) => {
      const tags = row.getValue('tags') as number[];
      if (tags.length === 0) {
        return null;
      }
      return (
        <div className="flex w-full flex-wrap gap-1 py-2 leading-6.5">
          {tags.map((tagID) => (
            <TagBadge key={tagID} tagID={tagID} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'comments',
    header: 'Notes',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-xs' },
  },
  {
    accessorKey: 'created_at',
    header: 'Created date',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated date',
    enableSorting: true,
    enableHiding: true,
    meta: { class: 'min-w-[170px]' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ItemsActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: { isAction: true },
  },
];

export const ItemList: React.FC = observer(() => {
  const store = React.useContext(StoreContext);
  const data = store.items;
  const [globalFilter, setGlobalFilter] = React.useState<any>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [layout, setLayout] = useState<LayoutType>(getSavedLayoutPreference());
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    getSavedLayoutColumnVisibilityPreference(layout)
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'created_at',
      desc: true,
    },
  ]);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'image',
    'title',
    'url',
    'tags',
    'description',
    'comments',
    'created_at',
    'updated_at',
    'actions',
  ]);

  useEffect(() => {
    setColumnFilters([
      {
        id: 'tags',
        value: store.selectedTagId,
      },
    ]);
  }, [store.selectedTagId]);

  useEffect(() => {
    const savedColumnVisibility = getSavedLayoutColumnVisibilityPreference(layout);
    setColumnVisibility(savedColumnVisibility);
  }, [layout]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnOrder,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });
  const currentRows = table.getPaginationRowModel().rows;
  const sortableColumns = table.getAllColumns().filter((column) => column.getCanSort());
  const visibilityToggleColumns = table.getAllColumns().filter((column) => column.getCanHide());

  const updateSorting = (columnId: string, isDesc: boolean) => {
    setSorting([
      {
        id: columnId,
        desc: isDesc,
      },
    ]);
  };

  const updateLayout = (newValue) => {
    setLayout(newValue);
    saveLayoutPreference(newValue);
  };

  const updateColumnVisibility = (columnId: string, isVisible: boolean) => {
    const newVisibility = {
      ...table.getState().columnVisibility,
      [columnId]: isVisible,
    };
    const remainingVisibleColumns = visibilityToggleColumns.filter((column) => newVisibility[column.id] !== false);

    if (remainingVisibleColumns.length === 0) {
      toast.error("The last remaining visible field can't be hidden", {
        position: 'top-center',
      });
      return;
    }
    setColumnVisibility(newVisibility);
    saveLayoutColumnVisibilityPreference(layout, newVisibility);
  };

  const layouts: Record<LayoutType, React.ReactNode> = {
    list: <ListLayout rows={currentRows} />,
    cards: <CardsLayout rows={currentRows} />,
    table: <TableLayout table={table} rows={currentRows} />,
  };

  return (
    <Dashboard>
      <header className="bg-background sticky top-0 z-50 flex h-(--header-height) w-full items-center gap-1.5 border-b px-4 backdrop-blur-sm group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2 className="h-4 w-4" />
              <span className="hidden @xl/main:inline-block">View</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            <div className="mx-1 mb-3">
              <LayoutSelector layout={layout} onChange={updateLayout} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Visible fields</DropdownMenuLabel>
            <FieldToggler columns={visibilityToggleColumns} onChange={updateColumnVisibility} />
          </DropdownMenuContent>
        </DropdownMenu>
        <Search table={table} globalFilter={globalFilter} />

        <Sorter
          selectedSortColumn={sorting[0]?.id}
          isDesc={sorting[0]?.desc}
          onChange={updateSorting}
          columns={sortableColumns}
        />

        <Button
          variant="default"
          onClick={() => {
            store.setIsShowEditModal(true);
            store.setType(ActionType.CREATE);
          }}
        >
          <PlusIcon />
          <span className="hidden @xl/main:inline-block">Add</span>
        </Button>
      </header>

      <div className={`m-4 overflow-hidden item-list--${layout}`}>
        {currentRows.length > 0 ? (
          layouts[layout]
        ) : (
          <div className="text-muted-foreground col-span-full py-8 text-center">No items.</div>
        )}
      </div>

      <Pagination table={table} />
    </Dashboard>
  );
});
