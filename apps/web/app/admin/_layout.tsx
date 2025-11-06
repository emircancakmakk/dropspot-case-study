export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="container mx-auto p-4">{children}</section>;
}
