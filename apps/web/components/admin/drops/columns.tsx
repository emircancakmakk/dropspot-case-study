"use client";

import { Badge } from "@/components/ui/badge";
import type { Drop } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { toLocalInputValue } from "@/lib/date";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Drop>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Başlık" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },

  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stok" />
    ),
  },

  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" />
    ),
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="default">Aktif</Badge>
      ) : (
        <Badge variant="secondary">Pasif</Badge>
      ),
  },

  {
    accessorKey: "claimStart",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Başlangıç" />
    ),

    cell: ({ row }) => (
      <span>{toLocalInputValue(row.original.claimStart)}</span>
    ),
  },

  {
    accessorKey: "claimEnd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bitiş" />
    ),
    cell: ({ row }) => <span>{toLocalInputValue(row.original.claimEnd)}</span>,
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Oluşturulma" />
    ),
    cell: ({ row }) => <span>{toLocalInputValue(row.original.createdAt)}</span>,
    enableHiding: true,
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DataTableRowActions drop={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
