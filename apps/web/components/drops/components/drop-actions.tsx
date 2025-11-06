"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Drop } from "@/lib/types";
import { toast } from "sonner";
import { joinDropAction, leaveDropAction, claimDropAction } from "@/actions/drops";

type Props = {
  drop: Pick<Drop, "id" | "claimStart" | "claimEnd" | "stock" | "isActive">;
  initialInWaitlist?: boolean;
  initialClaimed?: boolean;
};

function isApiError(error: unknown): error is { code?: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

function isClaimOpen(startISO: string, endISO: string) {
  const now = new Date();
  return now >= new Date(startISO) && now <= new Date(endISO);
}

export default function DropActions({
  drop,
  initialInWaitlist = false,
  initialClaimed = false,
}: Props) {
  const [inWaitlist, setInWaitlist] = React.useState(initialInWaitlist);
  const [claimed, setClaimed] = React.useState(initialClaimed);
  const [claimCode, setClaimCode] = React.useState<string | null>('');
  const [leaving, setLeaving] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const canClaim = drop.isActive && isClaimOpen(drop.claimStart, drop.claimEnd);

  React.useEffect(() => {
    if (claimed && !claimCode) {
      claimDropAction(drop.id)
        .then((res) => {
          if (res?.claimCode) setClaimCode(res.claimCode);
        })
        .catch(() => {
          /* sessiz geç */
        });
    }
  }, [claimed, claimCode, drop.id]);

  async function onJoin() {
    try {
      const res = await joinDropAction(drop.id);
      const joinedAt = res.wait?.joinedAt
        ? new Date(res.wait.joinedAt).toLocaleString("tr-TR")
        : undefined;
      toast.success(
        res.status === "already_joined"
          ? "Zaten bekleme listesindesin"
          : joinedAt
          ? `Bekleme listesine katıldın · ${joinedAt}`
          : "Bekleme listesine katıldın"
      );
      setInWaitlist(true);
      setClaimed(false);
      setClaimCode(null);
    } catch (e: unknown) {
      const message = isApiError(e) ? e.message : "Katılım başarısız";
      toast.error(message);
    }
  }

  async function onLeave() {
    setLeaving(true);
    try {
      const res = await leaveDropAction(drop.id);
      toast.success(
        res.status === "not_in_waitlist" ? "Listede değildin" : "Bekleme listesinden ayrıldın"
      );
      setInWaitlist(false);
    } catch (e: unknown) {
      if (isApiError(e)) {
        if (e.code === "already_claimed") {
          setClaimed(true);
          toast.error("Claim edilmiş kayıttan ayrılamazsın.");
        } else {
          toast.error(e.message);
        }
      } else {
        toast.error("Ayrılma başarısız");
      }
    } finally {
      setLeaving(false);
      setConfirmOpen(false);
    }
  }

  async function onClaim() {
    try {
      const res = await claimDropAction(drop.id);
      if (res.claimCode) setClaimCode(res.claimCode);
      setClaimed(true);
      toast.success(
        res.status === "already_claimed" ? "Daha önce hak talep ettin" : "Hak başarıyla talep edildi"
      );
    } catch (e: unknown) {
      if (isApiError(e)) {
        if (e.code === "not_on_waitlist") {
          return toast.error("Bekleme listesine katılmadan claim edemezsin.");
        }
        if (e.code === "claim_window_closed") {
          return toast.error("Claim penceresi kapalı.");
        }
        if (e.code === "not_eligible") {
          return toast.error("Sıran stok içinde değil.");
        }
        toast.error(e.message);
      } else {
        toast.error("Claim işlemi başarısız");
      }
    }
  }

  if (claimed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Claim kodun:</span>
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {claimCode ?? "—"}
        </code>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {inWaitlist ? (
        <>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)} disabled={leaving}>
            Bekleme listesinden ayrıl
          </Button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misin?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction onClick={onLeave} disabled={leaving}>
                  Ayrıl
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={onClaim} disabled={!canClaim}>
            {canClaim ? "Claim et" : "Claim kapalı"}
          </Button>
        </>
      ) : (
        <Button onClick={onJoin}>Bekleme listesine katıl</Button>
      )}

      {claimCode && (
        <code className="rounded bg-muted px-2 py-1 text-sm">{claimCode}</code>
      )}
    </div>
  );
}