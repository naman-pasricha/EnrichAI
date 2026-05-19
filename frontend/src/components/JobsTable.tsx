"use client"
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type LeadResult = {
  id: string
  linkedin_url: string
  full_name: string
  company: string
  email: string
  phone_number: string
  validation_status: "VALID" | "CATCH_ALL" | "INVALID" | "UNKNOWN"
  confidence_score: number
}

interface JobsTableProps {
  data: LeadResult[]
}

const columns: ColumnDef<LeadResult>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium text-slate-900">{row.getValue("full_name")}</div>,
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "email",
    header: "Email Discovered",
    cell: ({ row }) => <div className="text-blue-600 font-medium">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
    cell: ({ row }) => {
      const phone = row.getValue("phone_number") as string;
      return <div className={phone === "Not Found" ? "text-slate-400 text-sm" : "text-slate-700"}>{phone}</div>
    }
  },
  {
    accessorKey: "validation_status",
    header: "Validation",
    cell: ({ row }) => {
      const status = row.getValue("validation_status") as string
      if (status === "VALID") return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Valid SMTP</Badge>
      if (status === "CATCH_ALL") return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Catch-All</Badge>
      return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Invalid</Badge>
    },
  },
  {
    accessorKey: "confidence_score",
    header: "Score",
    cell: ({ row }) => {
      const score = row.getValue("confidence_score") as number
      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-slate-200 rounded-full h-2 max-w-[60px]">
            <div className={`h-2 rounded-full ${score > 90 ? 'bg-emerald-500' : score > 70 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
          </div>
          <span className="text-xs font-medium text-slate-600">{score}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "linkedin_url",
    header: "Source",
    cell: ({ row }) => (
      <a href={`https://${row.getValue("linkedin_url")}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
        View Profile
      </a>
    ),
  },
]

export function JobsTable({ data }: JobsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
