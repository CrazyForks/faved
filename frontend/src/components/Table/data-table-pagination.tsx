import type { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  rowsPerPage: number
  setRowsPerPage: (val: number) => void;
}

export function DataTablePagination<TData>({
  table,
  rowsPerPage,
  setRowsPerPage,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-2 sm:gap-0 my-5">
      <div className="flex-1 text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right pr-10">
        {table.getFilteredRowModel().rows.length} item{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""} total
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 w-full sm:w-auto">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden sm:block">Items per page</p>
          <p className="text-sm font-medium sm:hidden">Items:</p>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setRowsPerPage(newPageSize);
              table.setPageSize(newPageSize);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium min-w-[100px]">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
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
      </div >
    </div >
  )
}