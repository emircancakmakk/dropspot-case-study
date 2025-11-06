// components/admin/drops/data-table-row-actions.tsx
"use client";

import * as React from "react";
import { deleteDropAction, updateDropAction } from "@/actions/drops";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toLocalInputValue } from "@/lib/date";
import type { Drop } from "@/lib/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export function DataTableRowActions({ drop }: { drop: Drop }) {
  const [open, setOpen] = React.useState(false);
  const hiddenActiveRef = React.useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = React.useActionState(
    async (_prev: { ok: boolean }, formData: FormData) => {
      return await updateDropAction(drop.id, formData);
    },
    { ok: false }
  );

  React.useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      toast("Drop başarıyla güncellendi.", {
        description: "Değişiklikler kaydedildi.",
      });
    }
  }, [state]);

  async function handleDelete() {
    if (!confirm("Bu drop silinsin mi?")) return;
    const r = await deleteDropAction(drop.id);
    if (r?.ok) {
      toast("Silindi", { description: "Drop başarıyla silindi." });
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Satır işlemleri</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={pending}>
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Drop Düzenle</SheetTitle>
          </SheetHeader>

          {/* useActionState'den gelen formAction'u KULLAN */}
          <form action={formAction} className="p-4 mt-6 space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input id="title" name="title" defaultValue={drop.title} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={drop.description ?? ""}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={drop.stock}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="claimStart">Başlangıç</Label>
              <Input
                id="claimStart"
                name="claimStart"
                type="datetime-local"
                defaultValue={toLocalInputValue(String(drop.claimStart))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="claimEnd">Bitiş</Label>
              <Input
                id="claimEnd"
                name="claimEnd"
                type="datetime-local"
                defaultValue={toLocalInputValue(String(drop.claimEnd))}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="isActive">Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Drop kullanıcılar için görünür olsun.
                </p>
              </div>
              <input
                ref={hiddenActiveRef}
                type="hidden"
                name="isActive"
                value={drop.isActive ? "true" : "false"}
              />
              <Switch
                id="isActive"
                defaultChecked={drop.isActive}
                onCheckedChange={(v) => {
                  if (hiddenActiveRef.current) {
                    hiddenActiveRef.current.value = v ? "true" : "false";
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={pending}>
                Kaydet
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
