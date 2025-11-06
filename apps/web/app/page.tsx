import { api } from "@/lib/api"
import type { Drop } from "@/lib/types"
import Link from "next/link"

export default async function Page() {
  const drops = await api<Drop[]>("/api/drops")

  if (!drops.length)
    return <p className="text-muted-foreground text-center mt-20">Aktif drop bulunamadı.</p>

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {drops.map((drop) => (
        <Link
          key={drop.id}
          href={`/drops/${drop.id}`}
          className="block rounded-lg border p-4 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{drop.title}</h2>
          {drop.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{drop.description}</p>
          )}
          <div className="text-xs mt-2 space-y-1 text-muted-foreground">
            <p>Stok: {drop.stock}</p>
            <p>Claim: {new Date(drop.claimStart).toLocaleString("tr-TR")} – {new Date(drop.claimEnd).toLocaleString("tr-TR")}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
