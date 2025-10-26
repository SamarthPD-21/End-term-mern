"use client";

import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/lib/Auth";
import { notify } from '@/lib/toast'
import { resetUser } from "@/redux/userSlice";
import { useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { uploadProfileImageThunk } from "@/redux/userSlice";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  useCurrentUser();
  const user = useSelector((state: RootState) => state.user);
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; status: "uploading" | "success" | "error" | null; message?: string }>({ visible: false, status: null });

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email || "U").charAt(0).toUpperCase();

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout(); // API call to log out
    } catch (e) {
      console.error(e);
      // friendly message for logout failure
      try {
        const maybe: unknown = e;
        if (typeof maybe === 'object' && maybe !== null) {
          const resp = maybe as { response?: { status?: number } };
          if (resp.response?.status === 401) notify.info('Not logged in');
          else notify.error('Failed to sign out');
        } else {
          notify.error('Failed to sign out');
        }
      } catch {
        notify.error('Failed to sign out');
      }
    } finally {
      // Ensure local state and persisted storage are cleared immediately to
      // avoid races where other hooks read stale user data and trigger
      // re-authentication. Then reload so the app reflects the logged-out
      // server state (cookie cleared) and any server-side rendered pages
      // update accordingly.
      try { localStorage.removeItem('user'); } catch (_) {}
      dispatch(resetUser()); // Reset Redux user state
      setBusy(false);
      // Hard reload to make sure cookies/localStorage sync and no background
      // fetch re-establishes the session. This mirrors the login flow which
      // also reloads after authentication.
      window.setTimeout(() => window.location.reload(), 60);
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
  <div className="bg-spdBackground min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex">
        {/* Sidebar */}
  <aside className="w-64 bg-spdPrimary text-white p-6" style={{ backgroundColor: "#368581" }}>
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-xl font-bold">
                {user.profileImage ? (
                  <Image src={user.profileImage} alt={user.name || 'profile'} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <input id="sidebarProfileFile" type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setToast({ visible: true, status: 'uploading', message: 'Uploading profile image...' });
                // @ts-expect-error - Redux thunk typing; unwrap() can produce either user object or image string
                dispatch(uploadProfileImageThunk(file))
                  .unwrap()
                  .then(() => {
                    setToast({ visible: true, status: 'success', message: 'Profile image saved' });
                    setTimeout(() => setToast((s) => ({ ...s, visible: false })), 2500);
                  })
                  .catch((err: unknown) => {
                    const extractErrorMessage = (e: unknown) => {
                      if (e == null) return 'Upload failed';
                      if (typeof e === 'string') return e;
                      if (typeof e === 'object') {
                        const o = e as Record<string, unknown>;
                        const payload = o.payload as Record<string, unknown> | undefined;
                        const msg = payload?.error ?? o.message ?? o.error;
                        if (typeof msg === 'string') return msg;
                      }
                      return 'Upload failed';
                    };
                    const msg = extractErrorMessage(err);
                    setToast({ visible: true, status: 'error', message: String(msg) });
                    setTimeout(() => setToast((s) => ({ ...s, visible: false })), 4000);
                  });
              }} />
              <label htmlFor="sidebarProfileFile" className="absolute inset-0 flex items-center justify-center cursor-pointer" aria-hidden={false}>
                {/* Make the whole overlay clickable; remove nested button to ensure label click triggers input on all browsers */}
                <span className="opacity-0 group-hover:opacity-100 transform transition-opacity duration-150 bg-black/40 p-2 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
                  </svg>
                </span>
              </label>
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
      {/* Toast container bottom-right */}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-50">
        {toast.visible && (
          <div className={`max-w-xs w-full bg-white shadow-lg rounded-lg p-3 transform transition-all ${toast.status === 'uploading' ? 'opacity-90 scale-100' : toast.status === 'success' ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}>
            <div className="flex items-start gap-3">
              <div>
                {toast.status === 'uploading' && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                {toast.status === 'success' && <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>}
                {toast.status === 'error' && <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">!</div>}
              </div>
              <div>
                <div className="font-medium text-sm">{toast.status === 'uploading' ? 'Uploading...' : toast.status === 'success' ? 'Saved' : 'Error'}</div>
                <div className="text-xs text-gray-600">{toast.message}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
