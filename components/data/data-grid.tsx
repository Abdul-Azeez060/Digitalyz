"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { ValidationError } from "@/types/models";

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  validationErrors?: ValidationError[];
  onUpdateRow?: (rowIndex: number, field: string, value: any) => void;
  title?: string;
  searchPlaceholder?: string;
}

export function DataGrid<T>({
  data,
  columns,
  validationErrors = [],
  onUpdateRow,
  title,
  searchPlaceholder = "Search...",
}: DataGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.filter((error) => error.row === rowIndex);
  };

  const getCellError = (rowIndex: number, columnId: string) => {
    return validationErrors.find(
      (error) => error.row === rowIndex && error.column === columnId
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <p className="text-sm text-muted-foreground">
            {data.length} records • {validationErrors.length} validation issues
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-medium">
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center space-x-2",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}>
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3",
                                header.column.getIsSorted() === "asc"
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 -mt-1",
                                header.column.getIsSorted() === "desc"
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                const rowErrors = getRowErrors(rowIndex);
                const hasErrors = rowErrors.length > 0;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      hasErrors &&
                        "bg-red-50 hover:bg-red-100 dark:bg-red-950/20"
                    )}>
                    {row.getVisibleCells().map((cell) => {
                      const columnId = cell.column.id;
                      const cellError = getCellError(rowIndex, columnId);

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "relative",
                            cellError && "border-l-2 border-l-red-500"
                          )}>
                          <div className="flex items-center space-x-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                            {cellError && (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                {cellError.autoFixable && (
                                  <Badge className="ml-1 text-xs">
                                    Auto-fixable
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {cellError && (
                            <div className="absolute left-0 top-full z-10 mt-1 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800 shadow-lg min-w-max">
                              <div className="font-medium">
                                {cellError.message}
                              </div>
                              {cellError.suggestedFix && (
                                <div className="text-muted-foreground mt-1">
                                  Suggested: {cellError.suggestedFix}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            {table.getFilteredRowModel().rows.length} of {data.length} rows
          </Badge>
          {validationErrors.length > 0 && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {validationErrors.length} validation issues
            </Badge>
          )}
        </div>
        <div className="space-x-2">
          <Button
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
