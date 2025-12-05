import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLayoutEffect } from 'react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  rowsPerPage: number;
  setRowsPerPage: (val: number) => void;
}

export function DataTablePagination<TData>({ table, rowsPerPage, setRowsPerPage }: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [pageIndex]);

  return (
    <div className="my-5 flex flex-col items-center justify-between gap-2 px-2 sm:flex-row sm:gap-0">
      <div className="text-muted-foreground w-full flex-1 pr-10 text-center text-sm sm:w-auto sm:text-right">
        {table.getFilteredRowModel().rows.length} item{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} total
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-end">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">Items per page</p>
          <p className="text-sm font-medium sm:hidden">Items:</p>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setRowsPerPage(newPageSize);
              table.setPageSize(newPageSize);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
