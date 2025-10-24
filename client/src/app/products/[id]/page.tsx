"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
// framer-motion removed for React 19 compatibility; using CSS/Tailwind transitions instead
import { getProductById } from "@/lib/Product";
import ProductComments from "@/components/ProductComments";
import axios from "axios";
import { getCurrentUser } from "@/lib/User";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

type ProductType = {
  _id?: string;
  id?: string;
  image?: string;
  name?: string;
  category?: string;
  price?: number;
  description?: string;
  countInStock?: number;
  quantity?: number;
  stock?: number;
  launchAt?: string | null;
};

export default function ProductPage(props: unknown) {
  // Narrow props safely without using `any` so ESLint stays happy.
  const rawParams = (props as { params?: { id?: string } | Promise<{ id?: string }> }).params;
  // Next.js param values may be provided as a Promise; React.use(...) unwraps them
  // (React.use is available in React 19+).
  const resolved = (React as unknown as { use: (p: unknown) => { id?: string } }).use(rawParams);
  const id = resolved?.id;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const dispatch = useDispatch();
  // build a small client-only helper to navigate back to the category listing
  const goToCategory = (category?: string) => {
    if (!category) {
      // fallback to products root
      window.location.href = '/products';
      return;
    }
    const slug = String(category).toLowerCase().trim().replace(/\s+/g, '-');
    // force a full reload of the category page so it fetches fresh data
    window.location.href = `/products/${slug}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!id) { setProduct(null); return; }
        const res = await getProductById(id as string);
        setProduct(res.product || res);
        setAvgRating(Number(res.avgRating ?? 0));
        setReviewCount(Number(res.reviewCount ?? 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();

    (async () => {
      const me = await getCurrentUser();
      const user = me?.user ?? me;
      if (user) dispatch(setUser({ name: user.name ?? null, email: user.email ?? null, cartdata: user.cartdata ?? [], wishlistdata: user.wishlistdata ?? [], orderdata: user.orderdata ?? [], addressdata: user.addressdata ?? [] }));
    })();
  }, [id, dispatch]);

  const addToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await axios.post(`${API_URL}api/cart`, { productId: product._id || product.id, name: product.name, price: product.price, image: product.image || '/images/placeholder.png', quantity: qty }, { withCredentials: true });
      // refresh user
      const me = await getCurrentUser();
      const user = me?.user ?? me;
      if (user) dispatch(setUser({ name: user.name ?? null, email: user.email ?? null, cartdata: user.cartdata ?? [], wishlistdata: user.wishlistdata ?? [], orderdata: user.orderdata ?? [], addressdata: user.addressdata ?? [] }));
      // small micro-interaction: show temporary added state
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
    } catch (err) {
      console.error('add to cart error', err);
      alert('Add to cart failed');
    } finally {
      setAdding(false);
    }
  };

  const wishlist = async () => {
    if (!product) return;
    try {
      const payload = { productId: product._id || product.id, name: product.name, price: product.price, image: product.image };
      const resp = await axios.post(`${API_URL}api/user/wishlist`, payload, { withCredentials: true });
      const user = resp.data?.user ?? resp.data;
      if (user) dispatch(setUser(user));
      alert('Added to wishlist');
    } catch (err) {
      console.error('wishlist add error', err);
      alert('Failed to add to wishlist');
    }
  };

  if (loading) return <div className="p-12">Loading...</div>;
  if (!product) return <div className="p-12">Product not found</div>;

  // determine stock count field (support multiple names)
  const stock = Number(product.countInStock ?? product.quantity ?? product.stock ?? 0);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* spacer to avoid overlap with fixed navbar (approx height). Adjust if your navbar height differs. */}
      <div style={{ height: 84 }} />
      {/* Back button to category (animated, prettier) */}
      <div className="mb-6">
        <button
          onClick={() => goToCategory(product.category)}
          aria-label="Back to category"
          className="group inline-flex items-center gap-3 px-4 py-2 bg-white/95 rounded-full shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 active:scale-95"
        >
          <span className="relative inline-flex items-center justify-center w-9 h-9 bg-gradient-to-tr from-[#e6f7f6] to-[#d6f0ec] rounded-full shadow-md transform transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-[#18534d] transform transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: '0 10px 24px rgba(24,83,77,0.08)' }} />
          </span>
          <span className="text-sm font-semibold text-[#18534d]">Back to {product.category || 'Products'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: image */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-tr from-neutral-100 to-white shadow-2xl transform transition-all duration-700 animate-fade-in-left">
          <div className="relative h-96 md:h-[560px] bg-gray-50">
            <Image src={(product.image as string) || '/images/placeholder.png'} alt={(product.name as string) || 'product'} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
            <div className="absolute left-6 top-6 bg-white/90 text-sm px-3 py-1 rounded-lg shadow backdrop-blur-sm">
              <span className="font-semibold">{product.category || 'Product'}</span>
            </div>
            <div className="absolute right-6 bottom-6 bg-spdPrimary text-spdTextLight px-4 py-2 rounded-2xl shadow-lg font-bold" style={{ backgroundColor: '#368581', color: '#FAF9F6' }}>
              ₹{Number(product.price).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="p-6 bg-white rounded-3xl shadow-2xl transform transition-all duration-700 animate-fade-in-right">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-playfair font-extrabold mb-3 leading-tight animate-fade-in-up" style={{ textShadow: '0 6px 24px rgba(24,83,77,0.06)' }}>
                <span className="bg-gradient-to-r from-[#0f766e] to-[#2dd4bf] bg-clip-text text-transparent">{product.name}</span>
              </h1>
              <div className="w-28 h-1 rounded-full mb-4" style={{ background: 'linear-gradient(90deg,#2dd4bf,#0f766e)' }} />
              <div className="flex items-center gap-3 text-gray-600 mb-3">
                <div className="flex items-center gap-1 text-yellow-500 star-pulse">{Array.from({ length: Math.round(avgRating) || 0 }).map((_, i) => <span key={i}>⭐</span>)} </div>
                <div className="text-sm">{avgRating.toFixed(1)} • {reviewCount} reviews</div>
              </div>
              {product.launchAt && new Date(product.launchAt) > new Date() && (
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  Launching: {new Date(product.launchAt).toLocaleString()}
                </div>
              )}
              <div className="text-lg font-semibold mb-4">Ex-works price: <span className="text-2xl">₹{Number(product.price).toFixed(2)}</span></div>
            </div>
          </div>

          <div className="mb-6">
            <div className="p-6 bg-white/90 rounded-xl shadow-lg text-gray-700 leading-relaxed text-lg animate-fade-in-up" style={{ lineHeight: 1.85 }}>
              <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: (product.description as string) || '<p>No description available.</p>' }} />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label className="font-semibold">Quantity</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">-</button>
              <input value={qty} onChange={(e) => setQty(() => {
                const v = Math.max(1, Number(e.target.value) || 1);
                return Math.min(v, Math.max(1, stock));
              })} className="w-16 text-center p-2 border rounded" />
              <button onClick={() => setQty((q) => Math.min(Math.max(1, stock), q + 1))} disabled={qty >= Math.max(1, stock)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">+</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={addToCart} disabled={adding || qty > stock} className={`px-6 py-3 rounded-2xl text-lg font-bold shadow-lg transform transition-all ${justAdded ? 'bg-emerald-500 scale-105' : 'bg-[#368581]'}`} style={{ color: '#FAF9F6' }}>
              {adding ? 'Adding...' : (justAdded ? 'Added ✓' : 'Add to Cart')}
            </button>
            <button onClick={wishlist} className="px-6 py-3 rounded-2xl border font-bold">Wishlist</button>
          </div>

          <ProductComments productId={(product._id || product.id) as string} />
        </div>
      </div>
    </div>
  );
}
