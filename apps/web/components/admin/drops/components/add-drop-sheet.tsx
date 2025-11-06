"use client";

import * as React from "react";
import { createDropAction } from "@/actions/drops";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddDropSheet({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const hiddenActiveRef = React.useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = React.useActionState(
    async (_prev: { ok: boolean; error?: string }, formData: FormData) => {
      return await createDropAction(formData);
    },
    { ok: false }
  );

  React.useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      toast("Drop eklendi", { description: "Kayıt oluşturuldu." });
    } else if (state?.error) {
      toast("Hata", { description: state.error });
    }
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Drop
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Yeni Drop</SheetTitle>
        </SheetHeader>

        <form action={formAction} className="p-4 mt-6 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Başlık</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea id="description" name="description" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stok</Label>
            <Input id="stock" name="stock" type="number" min={0} defaultValue={0} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="claimStart">Başlangıç</Label>
            <Input id="claimStart" name="claimStart" type="datetime-local" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="claimEnd">Bitiş</Label>
            <Input id="claimEnd" name="claimEnd" type="datetime-local" required />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="space-y-1">
              <Label htmlFor="isActive">Aktif</Label>
              <p className="text-sm text-muted-foreground">Kullanıcılara görünür olsun.</p>
            </div>
            <input ref={hiddenActiveRef} type="hidden" name="isActive" value="true" />
            <Switch
              id="isActive"
              defaultChecked
              onCheckedChange={(v) => {
                if (hiddenActiveRef.current) hiddenActiveRef.current.value = v ? "true" : "false";
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Kaydediliyor" : "Kaydet"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
