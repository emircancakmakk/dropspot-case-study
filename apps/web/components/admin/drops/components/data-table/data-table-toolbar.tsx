"use client";

import type { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  const titleCol = table.getColumn("title");
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Başlıkta ara..."
        value={(titleCol?.getFilterValue() as string) ?? ""}
        onChange={(e) => titleCol?.setFilterValue(e.target.value)}
        className="h-9 w-[240px]"
      />
      {isFiltered ? (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-9 px-2"
        >
          Sıfırla <Cross2Icon className="ml-1 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
