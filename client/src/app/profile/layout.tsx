"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/lib/Auth";
import { resetUser } from "@/redux/userSlice";
import { useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  useCurrentUser();
  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout(); // API call to log out
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(resetUser()); // Reset Redux user state
      setBusy(false);
    }
  };

  const navItems = [
    { href: "/profile", label: "Overview" },
    { href: "/profile/wishlist", label: "Wishlist" },
    { href: "/profile/orders", label: "Orders" },
    { href: "/profile/addresses", label: "Addresses" },
    { href: "/profile/settings", label: "Settings" },
  ];

  return (
    <div className="bg-veblyssBackground min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-64 bg-veblyssPrimary text-white p-6" style={{ backgroundColor: "#368581" }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <h2 className="mt-3 text-lg font-bold">{user.name || "Unnamed User"}</h2>
            <p className="text-sm opacity-80">{user.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-lg ${
                    active ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            disabled={busy}
            className="mt-6 w-full bg-white/10 border border-white/20 py-2 rounded-lg"
          >
            {busy ? "Signing out..." : "Sign out"}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
