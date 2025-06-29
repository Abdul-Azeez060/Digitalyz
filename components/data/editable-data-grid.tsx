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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
  Wand2,
} from "lucide-react";
import { ValidationError } from "@/types/models";
import { useData } from "@/contexts/data-context";

interface EditableDataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  validationErrors?: ValidationError[];
  onUpdateRow?: (rowIndex: number, field: string, value: any) => void;
  title?: string;
  searchPlaceholder?: string;
  dataType: "clients" | "workers" | "tasks";
}

export function EditableDataGrid<T>({
  data,
  columns,
  validationErrors = [],
  onUpdateRow,
  title,
  searchPlaceholder = "Search...",
  dataType,
}: EditableDataGridProps<T>) {
  const { dispatch } = useData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const enhancedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      cell: ({ row, column: col }: any) => {
        const cellValue = row.getValue(col.id);
        const isEditing =
          editingCell?.row === row.index && editingCell?.column === col.id;
        const cellError = getCellError(row.index, col.id);

        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit(row.index, col.id);
                  } else if (e.key === "Escape") {
                    setEditingCell(null);
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveEdit(row.index, col.id)}>
                <Save className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingCell(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2 group">
            <div
              className="flex-1 cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => handleStartEdit(row.index, col.id, cellValue)}>
              {column.cell
                ? flexRender(column.cell, { row, column: col })
                : String(cellValue)}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStartEdit(row.index, col.id, cellValue)}>
                <Edit className="h-3 w-3" />
              </Button>
              {cellError?.autoFixable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAutoFix(row.index, col.id, cellError)}
                  title="Auto-fix this error">
                  <Wand2 className="h-3 w-3 text-blue-500" />
                </Button>
              )}
            </div>
          </div>
        );
      },
    }));
  }, [columns, editingCell, editValue, validationErrors]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
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

  const handleStartEdit = (
    rowIndex: number,
    columnId: string,
    currentValue: any
  ) => {
    setEditingCell({ row: rowIndex, column: columnId });
    setEditValue(String(currentValue || ""));
  };

  const handleSaveEdit = (rowIndex: number, columnId: string) => {
    if (onUpdateRow) {
      onUpdateRow(rowIndex, columnId, editValue);
    }

    // Update the data in context
    const updateAction = {
      type: `UPDATE_${dataType.slice(0, -1).toUpperCase()}` as any,
      payload: {
        id: (data[rowIndex] as any).id,
        updates: { [columnId]: editValue },
      },
    };
    dispatch(updateAction);

    setEditingCell(null);
    setEditValue("");
  };

  const handleAutoFix = (
    rowIndex: number,
    columnId: string,
    error: ValidationError
  ) => {
    if (error.suggestedFix && onUpdateRow) {
      onUpdateRow(rowIndex, columnId, error.suggestedFix);

      const updateAction = {
        type: `UPDATE_${dataType.slice(0, -1).toUpperCase()}` as any,
        payload: {
          id: (data[rowIndex] as any).id,
          updates: { [columnId]: error.suggestedFix },
        },
      };
      dispatch(updateAction);
    }
  };

  const getRowErrors = (rowIndex: number) => {
    return validationErrors.filter((error) => error.row === rowIndex);
  };

  const getCellError = (rowIndex: number, columnId: string) => {
    return validationErrors.find(
      (error) => error.row === rowIndex && error.column === columnId
    );
  };

  const criticalErrors = validationErrors.filter(
    (e) => e.type === "error"
  ).length;
  const warnings = validationErrors.filter((e) => e.type === "warning").length;
  const autoFixableErrors = validationErrors.filter(
    (e) => e.autoFixable
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <p className="text-sm text-muted-foreground">
            {data.length} records • {criticalErrors} errors • {warnings}{" "}
            warnings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {autoFixableErrors > 0 && (
            <Button
              size="sm"
              onClick={() => {
                validationErrors
                  .filter((e) => e.autoFixable && e.suggestedFix)
                  .forEach((error) => {
                    if (error.row !== undefined && error.column) {
                      handleAutoFix(error.row, error.column, error);
                    }
                  });
              }}>
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-fix {autoFixableErrors} issues
            </Button>
          )}
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

      {criticalErrors > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalErrors} critical errors found. Click on cells to edit or
            use auto-fix where available.
          </AlertDescription>
        </Alert>
      )}

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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
          {autoFixableErrors > 0 && (
            <Badge variant="secondary">
              <Wand2 className="h-3 w-3 mr-1" />
              {autoFixableErrors} auto-fixable
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
