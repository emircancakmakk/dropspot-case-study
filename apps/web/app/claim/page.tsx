import { api, ApiError } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

type ClaimItem = {
  dropId: string;
  dropTitle: string;
  claimCode: string;
  claimAt: string;
  claimWindow: { start: string; end: string };
};

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  let claims: ClaimItem[] = [];
  try {
    claims = await api<ClaimItem[]>("/api/me/claims", { cache: "no-store" });
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) {
      redirect(`/signin`);
    }
    throw e;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Claim Kodlarım</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Henüz herhangi bir drop claim etmedin.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drop</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Claim Penceresi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((c) => (
                  <TableRow key={c.claimCode}>
                    <TableCell className="font-medium">{c.dropTitle}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {c.claimCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(c.claimAt).toLocaleString("tr-TR")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.claimWindow.start).toLocaleString("tr-TR")} –{" "}
                      {new Date(c.claimWindow.end).toLocaleString("tr-TR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
