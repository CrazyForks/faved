"use client"

import * as React from "react"
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { StoreContext } from "@/store/storeContext"
import { DataTableToolbar } from "./DataTableToolbar"
import { observer } from "mobx-react-lite"
import { PopoverSort } from "./PopoverSort"
import { Popover } from "../ui/popover"
import { DataTablePagination } from "./data-table-pagination"
import { CardView } from "./CardView"
import { Card } from "../ui/card"
import { ItemType } from "@/types/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Blocks as BlocksIcon, Table as TableIcon } from "lucide-react"
import { createColumns, getTableViewPreference, setTableViewPreference } from "./utils"


export const DataTable: React.FC = observer(() => {
  const [globalFilter, setGlobalFilter] = React.useState<any>([]);
  const store = React.useContext(StoreContext);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [selectedSortColumn, setSelectedSortColumn] = React.useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const columns: ColumnDef<ItemType>[] = createColumns() as unknown as ColumnDef<ItemType>[];
  const data = store.selectedTagId === '0' ? store.items : store.items.filter((item => {
    return (store.selectedTagId === null && item.tags.length === 0) || item.tags.includes(Number(store.selectedTagId) as unknown as string);
  }))
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
    globalFilterFn: (row, columnId, value, addMeta) => {
      const searchValue = String(value).toLocaleLowerCase().trim();

      if (searchValue === "") {
        return true;
      }

      const searchTerms = searchValue.split(/[ ,.;\t\n]+/).filter(term => term !== "");

      return searchTerms.every(term => {
        for (const cell of row.getAllCells()) {
          const cellValue = String(cell.getValue()).toLocaleLowerCase();

          if (cellValue.includes(term)) {
            store.setCurrentPage(1)
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
        typeof updaterOrValue === "function"
          ? updaterOrValue(table.getState().pagination)
          : updaterOrValue;

      store.setCurrentPage(newPagination.pageIndex + 1);
      setRowsPerPage(newPagination.pageSize);
    },
  })
  const startIndex = (store.currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = table.getRowModel().rows.slice(startIndex, endIndex);
  const sortableColumns = columns.filter((column) => column.enableSorting);

  const [showSort, setShowSort] = React.useState(false);
  const handleSortChange = (columnAccessorKey: string, sortDirection: 'asc' | 'desc') => {
    store.setCurrentPage(1);
    if (columnAccessorKey === "") {
      setSorting([]);
      setSelectedSortColumn(null);
      return;
    }

    setSelectedSortColumn(columnAccessorKey);

    const currentSort = sorting[0];
    const isCurrentColumn = currentSort?.id === columnAccessorKey;

    const newSortDesc = sortDirection === 'desc' || (!isCurrentColumn ? false : !currentSort?.desc)

    setSorting([{
      id: columnAccessorKey,
      desc: newSortDesc,
    }]);
  };

  const toggleTableView = () => {
    const newValue = !isTableView;
    setIsTableView(newValue);
    setTableViewPreference(newValue);
    store.setItems(store.itemsOriginal);
  };

  React.useEffect(() => {
    table
      .getAllColumns()
      .filter(
        (column) =>
          typeof column.accessorFn !== "undefined" && column.getCanHide()
      )
      .map((column) => {
        column.toggleVisibility(false)
      })
  }, [])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-4 m-4">
        <DataTableToolbar table={table} globalFilter={globalFilter} />
        <Popover open={showSort} onOpenChange={setShowSort}>
          <PopoverSort
            selectedSortColumn={selectedSortColumn}
            handleSortChange={handleSortChange}
            sortableColumns={sortableColumns}
          />
        </Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={toggleTableView} variant="outline">
              {!isTableView ? <TableIcon /> : <BlocksIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p> {!isTableView ? "Table view" : "Card view"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="m-4 overflow-hidden ">
        {isTableView ? <Table className=" table-fixed w-full">
          <TableBody>
            {currentRows.length ? (
              currentRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover-action-container"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id} className={`${cell.id.split("_")[1] !== "id" ? 'w-full pb-5 pt-5 pl-6 break-words' : 'w-16'}`}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table> :
          <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @2xl/main:grid-cols-2 @5xl/main:grid-cols-3 @7xl/main:grid-cols-4 @min-[108rem]/main:grid-cols-5  @min-[126rem]/main:grid-cols-6 @min-[142rem]/main:grid-cols-7">
            {currentRows.length > 0 ? (
              currentRows.map((row) => {
                const el = row.original;
                return (
                  <Card key={el.id} className="@container/card relative">
                    <CardView el={el} />
                  </Card>)

              })
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No results found.
              </div>
            )}
          </div >
        }
      </div>
      <DataTablePagination table={table} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
    </div>
  )
})