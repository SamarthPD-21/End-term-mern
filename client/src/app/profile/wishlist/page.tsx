"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/userSlice";
import { getCurrentUser } from "@/lib/User";

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
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [wishlistArray]);

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
                  {!isLaunched && (
                    <button onClick={() => handleRemove(pid)} className="text-red-600 text-sm">Remove</button>
                  )}
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
