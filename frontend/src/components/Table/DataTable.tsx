'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { StoreContext } from '@/store/storeContext';
import { Search } from './Search.tsx';
import { observer } from 'mobx-react-lite';
import { Sorter } from './Sorter.tsx';
import { DataTablePagination } from './data-table-pagination';
import { CardView } from './CardView';
import { Card } from '../ui/card';
import { ItemType } from '@/types/types';
import { LayoutGrid as CardsIcon, Table as TableIcon } from 'lucide-react';
import { createColumns, getTableViewPreference, setTableViewPreference } from './utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const DataTable: React.FC = observer(() => {
  const [globalFilter, setGlobalFilter] = React.useState<any>([]);
  const store = React.useContext(StoreContext);
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'created_at',
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns: ColumnDef<ItemType>[] = createColumns() as unknown as ColumnDef<ItemType>[];
  const data =
    store.selectedTagId === '0'
      ? store.items
      : store.items.filter((item) => {
          return (
            (store.selectedTagId === null && item.tags.length === 0) ||
            item.tags.includes(Number(store.selectedTagId) as unknown as string)
          );
        });
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [isTableView, setIsTableView] = React.useState<boolean>(getTableViewPreference());

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
    manualPagination: true,
    globalFilterFn: (row, columnId, value) => {
      const searchValue = String(value).toLocaleLowerCase().trim();

      if (searchValue === '') {
        return true;
      }

      const searchTerms = searchValue.split(/[ ,.;\t\n]+/).filter((term) => term !== '');

      return searchTerms.every((term) => {
        for (const cell of row.getAllCells()) {
          const cellValue = String(cell.getValue()).toLocaleLowerCase();

          if (cellValue.includes(term)) {
            store.setCurrentPage(1);
            return true;
          }
        }
        return false;
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: store.currentPage - 1,
        pageSize: rowsPerPage,
      },
    },
    onPaginationChange: (updaterOrValue) => {
      const newPagination =
        typeof updaterOrValue === 'function' ? updaterOrValue(table.getState().pagination) : updaterOrValue;

      store.setCurrentPage(newPagination.pageIndex + 1);
      setRowsPerPage(newPagination.pageSize);
    },
  });
  const startIndex = (store.currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);
  const sortableColumns = columns.filter((column) => column.enableSorting);

  const handleSortChange = (columnAccessorKey: string, isDesc: boolean) => {
    setSorting([
      {
        id: columnAccessorKey,
        desc: isDesc,
      },
    ]);

    store.setCurrentPage(1);
  };

  const changeTableView = (newValue) => {
    setIsTableView(newValue);
    setTableViewPreference(newValue);
  };

  React.useEffect(() => {
    table
      .getAllColumns()
      .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
      .map((column) => {
        column.toggleVisibility(false);
      });
  }, [table]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4 m-4">
        <Search table={table} globalFilter={globalFilter} />
        <Sorter
          selectedSortColumn={sorting[0]?.id}
          isDesc={sorting[0]?.desc}
          handleSortChange={handleSortChange}
          sortableColumns={sortableColumns}
        />

        <ToggleGroup
          variant="outline"
          type="single"
          value={isTableView ? 'table' : 'cards'}
          onValueChange={(v) => {
            if (v) changeTableView(v === 'table');
          }}
        >
          <ToggleGroupItem value="cards">
            <CardsIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="table">
            <TableIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="m-4 overflow-hidden ">
        {isTableView ? (
          <Table className=" table-fixed w-full">
            <TableBody>
              {currentRows.length ? (
                currentRows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover-action-container"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={`${cell.id.split('_')[1] !== 'id' ? 'w-full pb-5 pt-5 pl-6 break-words' : 'w-16'}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @2xl/main:grid-cols-2 @5xl/main:grid-cols-3 @7xl/main:grid-cols-4 @min-[108rem]/main:grid-cols-5  @min-[126rem]/main:grid-cols-6 @min-[142rem]/main:grid-cols-7">
            {currentRows.length > 0 ? (
              currentRows.map((row) => {
                const el = row.original;
                return (
                  <Card key={el.id} className="@container/card relative">
                    <CardView el={el} />
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">No results found.</div>
            )}
          </div>
        )}
      </div>
      <DataTablePagination table={table} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
    </div>
  );
});
