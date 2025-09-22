"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-visible"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm border-separate border-spacing-0", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:first-child_td:first-child]:rounded-tl-lg",
        "[&_tr:first-child_td:last-child]:rounded-tr-lg",
        "[&_tr:last-child_td:first-child]:rounded-bl-lg",
        "[&_tr:last-child_td:last-child]:rounded-br-lg",
        "[&_tr:first-child_td]:border-t",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 font-medium",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "align-top hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        "bg-background",
        "[&:first-child]:border-l [&:first-child]:border-t [&:first-child]:border-b",
        "[&:last-child]:border-r [&:last-child]:border-t [&:last-child]:border-b",
        "[&:not(:first-child):not(:last-child)]:border-t [&:not(:first-child):not(:last-child)]:border-b",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-top whitespace-normal break-words hyphenate bg-background",
        "[&:first-child]:border-l [&:first-child]:border-b",
        "[&:last-child]:border-r [&:last-child]:border-b",
        "[&:not(:first-child):not(:last-child)]:border-b",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}