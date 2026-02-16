"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/comics", label: "Comics" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/links", label: "Links" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show nav on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">Running Red Admin</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="border-b border-gray-300 bg-white">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm ${
                pathname === item.href
                  ? "border-b-2 border-gray-900 font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
