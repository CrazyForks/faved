import {Button} from "@/components/ui/button"
import {ArrowDown, ArrowDownUp, ArrowUp} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {JSX} from "react";

export const Sorter: ({selectedSortColumn, isDesc, handleSortChange, sortableColumns}: {
  selectedSortColumn: string | null;
  isDesc: boolean;
  handleSortChange: any;
  sortableColumns: Array<any>
}) => (JSX.Element) = ({selectedSortColumn, isDesc, handleSortChange, sortableColumns}) => {

  const handle = (colAccessorKey) => {
    let newIsDesc = isDesc;
    if (selectedSortColumn === colAccessorKey) {
      newIsDesc = !isDesc
    }
    handleSortChange(colAccessorKey, newIsDesc)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="icon"><ArrowDownUp/></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align='end' className='min-w-40'
      >
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        {sortableColumns.map((column) => (
          <DropdownMenuItem
            key={column.accessorKey}
            onSelect={(event: any) => {
              // prevent the dropdown from closing on selection
              event.preventDefault();
              handle(column.accessorKey)
            }}
            className={"flex justify-between " + (column.accessorKey === selectedSortColumn ? ' bg-accent' : '')}
          >
            <span>{column.header}</span>
            <span>{column.accessorKey === selectedSortColumn && (isDesc ? <ArrowDown className="text-primary"/> :
              <ArrowUp className="text-primary"/>)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
