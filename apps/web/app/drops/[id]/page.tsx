import DropActions from "@/components/drops/components/drop-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api, ApiError } from "@/lib/api";
import type { DropWithUserStatus } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function DropDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  let drop;

  try {
    drop = await api<DropWithUserStatus>(`/api/drops/${id}`);
  } catch (e) {
    if(e instanceof ApiError && e.statusCode === 401) {
      redirect(`/signin`);
    }
    throw e;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{drop.title}</CardTitle>
          <Badge variant={drop.isActive ? "default" : "secondary"}>
            {drop.isActive ? "Aktif" : "İnaktif"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {drop.description && (
            <>
              <p className="text-muted-foreground">{drop.description}</p>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Stok</div>
              <div className="font-medium">{drop.stock}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Claim Başlangıcı</div>
              <div className="font-medium">
                {new Date(drop.claimStart).toLocaleString("tr-TR")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Claim Bitişi</div>
              <div className="font-medium">
                {new Date(drop.claimEnd).toLocaleString("tr-TR")}
              </div>
            </div>
          </div>

          <Separator />

          <DropActions
            drop={{
              id: drop.id,
              claimStart: drop.claimStart,
              claimEnd: drop.claimEnd,
              stock: drop.stock,
              isActive: drop.isActive,
            }}
            initialInWaitlist={drop.userJoined}
            initialClaimed={drop.userClaimed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
