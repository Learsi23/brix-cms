"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminChatButton from "@/components/AdminChatButton";

const navItems = [
  { href: "/admin",              label: "Pages",         icon: "📄", exact: true },
  { href: "/admin/settings",     label: "Navbar & Footer", icon: "🎨" },
  { href: "/admin/media",        label: "Media",         icon: "🖼️" },
  { href: "/admin/products",     label: "Products",      icon: "📦" },
  { href: "/admin/orders",       label: "Orders",        icon: "🛒" },
  { href: "/admin/backup",       label: "Backup",        icon: "💾" },
  { href: "/admin/ai-config",    label: "Configuration", icon: "⚙️" },
  { href: "/admin/ai-generator", label: "AI Generator",  icon: "🤖" },
  { href: "/admin/pdf-products", label: "PDF → Products",icon: "📑" },
  { href: "/admin/figma",        label: "Figma Import",  icon: "🎨" },
  { href: "/admin/account",      label: "Account",       icon: "👤" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-menu.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">EdenCMS</p>
              <p className="text-slate-500 text-[10px]">admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive(item.href, item.exact)
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-xs w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <span className="text-xs w-4 text-center">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Floating admin chat button */}
      <AdminChatButton />
    </>
  );
}
