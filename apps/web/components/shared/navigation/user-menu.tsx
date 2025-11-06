import Link from "next/link";
import { SignOutButton } from "../buttons/sign-out-button";
import { getAuth } from "@/lib/auth";

export default async function UserMenu() {
  const { token, role } = await getAuth();

  if (!token)
    return (
      <div className="flex gap-2 text-sm">
        <Link href="/signin">Giriş Yap</Link>
        <Link href="/signup">Kayıt Ol</Link>
      </div>
    );
  return (
    <div className="flex items-center gap-3 text-sm">
      {role === "ADMIN" && <Link href="/admin">Admin</Link>}
      <SignOutButton />
    </div>
  );
}
