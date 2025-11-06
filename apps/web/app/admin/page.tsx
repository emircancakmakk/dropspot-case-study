// app/admin/page.tsx
import { columns } from "@/components/admin/drops/components/data-table/columns";
import { DataTable } from "@/components/admin/drops/components/data-table/data-table";
import { listDrops } from "@/components/admin/drops/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminDropsPage() {
  const drops = await listDrops();
  return (
    <div className="p-6">
      <DataTable columns={columns} data={drops} />
    </div>
  );
}
