"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/userSlice";
import { getCurrentUser } from "@/lib/User";
import { notify } from '@/lib/toast'

interface WishlistEntry {
  productId?: string;
  id?: string;
  name?: string;
  price?: number;
  image?: string;
}

export default function WishlistPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Normalize wishlist which can be stored as an array or an object depending on server shape
  const wishlistArray: WishlistEntry[] = useMemo(() => {
    const rawWishlist = user.wishlistdata ?? [];
    if (!rawWishlist) return [];
    if (Array.isArray(rawWishlist)) return rawWishlist as unknown as WishlistEntry[];
    // if it's an object map, convert to array
    try {
      return Object.entries(rawWishlist as unknown as Record<string, unknown>).map(([, v]) => v as WishlistEntry);
    } catch {
      return [];
    }
  }, [user.wishlistdata]);

  const [products, setProducts] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [localWishlist, setLocalWishlist] = useState<WishlistEntry[]>(() => wishlistArray);

  type MaybeMessage = { message?: string };

  useEffect(() => setLocalWishlist(wishlistArray), [wishlistArray]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
      const ids = wishlistArray.map((w) => w.productId || w.id).filter(Boolean);
      if (ids.length === 0) {
        setProducts({});
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API}/api/products/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) return;
        const json = await res.json();
        const prods: unknown[] = json.products || [];
        const map: Record<string, unknown> = {};
        prods.forEach((p) => {
          if (!p) return;
          const prod = p as Record<string, unknown>;
          const key = String(prod._id ?? prod.id ?? "");
          if (key) map[key] = prod;
        });
        if (mounted) setProducts(map);
      } catch (e) {
        console.error("Failed to load wishlist products", e);
        notify.error('Failed to load wishlist items')
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [wishlistArray]);

  // Auto-move launched wishlist items to cart once products are loaded.
  // Runs once per mount (guarded by ranAutoRef).
  const ranAutoRef = useRef(false);
  useEffect(() => {
    if (ranAutoRef.current) return;
    ranAutoRef.current = true;

    const autoMove = async () => {
      if (!localWishlist || localWishlist.length === 0) return;
      const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

      for (const entry of localWishlist) {
        try {
          const pid = String(entry.productId || entry.id || "");
          if (!pid) continue;
          const p = products[pid] as Record<string, unknown> | undefined;

          // If product removed from server, remove from wishlist and notify
          if (!p) {
            await handleRemove(pid);
            notify.info(`${entry.name ?? 'Item'} is no longer available and was removed from your wishlist`);
            continue;
          }

          // Determine launched state (launchAt preferred; fallback to createdAt)
          const launchAtStr = typeof p['launchAt'] === 'string' ? p['launchAt'] : undefined;
          const createdAtStr = typeof p['createdAt'] === 'string' ? p['createdAt'] : undefined;
          const launched = launchAtStr ? (new Date(launchAtStr) <= new Date()) : (createdAtStr ? (new Date(createdAtStr) <= new Date()) : true);

          if (!launched) continue;

          // If already in cart, skip
          const alreadyInCart = (user?.cartdata ?? []).some((c: unknown) => {
            const it = c as Record<string, unknown>;
            const cid = it['productId'] ?? it['id'] ?? it['_id'];
            return String(cid ?? '') === pid;
          });
          if (alreadyInCart) {
            // remove from wishlist because it's already in cart
            await handleRemove(pid);
            continue;
          }

          // Attempt to move to cart
          // Keep optimistic UI minimal here; we'll refresh server state on success
          const resp = await fetch(`${API}/api/cart`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: pid, name: entry.name, price: entry.price ?? 0, image: entry.image ?? '/images/placeholder.png', quantity: 1 }),
          });

          if (resp.ok) {
            // refresh user state
            const me = await getCurrentUser();
            const u = me?.user ?? me;
            if (u) dispatch(setUser(u));
            notify.success(`${entry.name ?? 'Item'} moved to cart`);
            // remove from local wishlist view
            setLocalWishlist((prev) => prev.filter((x) => String(x.productId || x.id) !== pid));
          } else {
            // parse server message if present
            let json: unknown = null;
            try { json = await resp.json(); } catch { /* ignore */ }
            // handle common statuses
            if (resp.status === 404) {
              // product not found — remove from wishlist
              await handleRemove(pid);
              notify.info(`${entry.name ?? 'Item'} is no longer available and was removed from your wishlist`);
            } else if (resp.status === 400 || resp.status === 409 || resp.status === 422) {
              const reason = (json && typeof json === 'object' && 'message' in json && typeof (json as MaybeMessage).message === 'string') ? (json as MaybeMessage).message : 'Could not move to cart';
              notify.error(`${entry.name ?? 'Item'}: ${reason}`);
            } else {
              notify.error(`Failed to move ${entry.name ?? 'item'} to cart`);
            }
          }
        } catch (err) {
          console.error('auto-move wishlist error', err);
          notify.error('Failed to auto-move wishlist items')
        }
      }
    };

    // only run after products have been loaded (products object populated)
    if (Object.keys(products).length > 0) {
      autoMove();
    } else {
      // fallback: run once after a short delay to allow load effect to populate
      const t = setTimeout(() => { if (Object.keys(products).length > 0) autoMove(); }, 700);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleRemove = async (id?: string) => {
    if (!id) return;
    const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
    try {
      const pid = id;
      const res = await fetch(`${API}/api/user/wishlist/${pid}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove");
      // refresh user
      const me = await getCurrentUser();
      const u = me?.user ?? me;
      if (u) dispatch(setUser(u));
    } catch (e) {
      console.error(e);
      notify.error('Failed to remove item from wishlist')
    }
  };

  const handleMoveToCart = async (entry: WishlistEntry) => {
    const pid = entry.productId || entry.id;
    if (!pid) return;
    const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

    // Optimistic: remove from local UI immediately and trigger confetti
    setLocalWishlist((prev) => prev.filter((x) => String(x.productId || x.id) !== String(pid)));
    // no confetti: rely on optimistic UI and toast feedback

    try {
      const res = await fetch(`${API}/api/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid, name: entry.name, price: entry.price || 0, image: entry.image || "/images/placeholder.png", quantity: 1 }),
      });
      if (!res.ok) throw new Error('Failed to move to cart');
      // success: refresh user state from server
      const me = await getCurrentUser();
      const u = me?.user ?? me;
      if (u) dispatch(setUser(u));
    } catch (e) {
      console.error(e);
      notify.error('Failed to move item to cart')
      // revert optimistic change
      setLocalWishlist((prev) => [entry, ...prev]);
    } finally {
      // nothing to clean locally; server refresh will canonicalize state
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Your Wishlist</h2>
      {loading ? (
        <p className="text-sm text-gray-600">Loading …</p>
      ) : wishlistArray.length === 0 ? (
        <p className="text-sm text-gray-600">No saved items.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localWishlist.map((entry) => {
            const pid = String(entry.productId || entry.id || "");
            const p = products[pid] as Record<string, unknown> | undefined;
            const launchAt = p && typeof p['launchAt'] === 'string' ? (p['launchAt'] as string) : undefined;
            const isLaunched = !launchAt || new Date(launchAt) <= new Date();
            // normalized display values
            const displayName = entry.name ?? (p && typeof p['name'] === 'string' ? (p['name'] as string) : 'Product');
            const displayImage = String(entry.image ?? (p && typeof p['image'] === 'string' ? (p['image'] as string) : '/images/placeholder.png'));
            const rawPrice = entry.price ?? (p && (typeof p['price'] === 'number' ? (p['price'] as number) : Number(p['price'] ?? 0))) ?? 0;
            const displayPrice = Number(rawPrice || 0);
            return (
              <li key={pid} className={`bg-white rounded-lg shadow p-4 flex gap-4 items-center relative animate-fade-in`}>
                <div className="w-24 h-24 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  <Image src={displayImage} alt={displayName} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${pid}`} className="font-medium text-sm text-spdText block">{displayName}</Link>
                  <div className="text-xs text-gray-500">₹{displayPrice.toFixed(2)}</div>
                  {launchAt && new Date(launchAt) > new Date() && (
                    <div className="mt-2 inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Launching soon</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isLaunched ? (
                    <button onClick={() => handleMoveToCart(entry)} className="bg-[#368581] text-white px-3 py-1 rounded-md text-sm hover:scale-105 transition-transform">Move to cart</button>
                  ) : (
                    <button onClick={() => handleRemove(pid)} className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">Remove</button>
                  )}
                </div>

                {/* no DOM-based confetti; using canvas-confetti instead */}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
