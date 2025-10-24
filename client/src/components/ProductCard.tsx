"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import { getCurrentUser } from "@/lib/User";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  _id?: string;
  launchAt?: string | null;
}

export default function ProductCard({
  product,
  setNotice,
}: {
  product: Product;
  setNotice: (message: string | null) => void;
}) {
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [wishAnim, setWishAnim] = useState(false);
  const dispatch = useDispatch();

  const addToCart = async (p: Product) => {
  setLoadingAdd(true);
    try {
      // add/update product in cart
      await axios.post(
        `${API_URL}api/cart`,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          image: p.image || "/images/placeholder.png",
          quantity: 1,
        },
        { withCredentials: true }
      );

      // fetch updated user with full data
      const me = await getCurrentUser();
      const user = me?.user ?? me;

      if (user) {
        dispatch(
          setUser({
            name: user.name ?? null,
            email: user.email ?? null,
            cartdata: user.cartdata ?? [],   
            wishlistdata: user.wishlistdata ?? [],
            orderdata: user.orderdata ?? [],
            addressdata: user.addressdata ?? [],
          })
        );
      }

      setNotice("Added to cart");
      // no confetti: rely on toast/visual feedback only
    } catch (err) {
      console.error("addToCart error:", err);
      setNotice("Add to cart failed");
    } finally {
  setLoadingAdd(false);
  setTimeout(() => setNotice(null), 3000);
    }
  };

  const wishlistProduct = async (p: Product) => {
    // animate heart briefly
    setWishAnim(true);
    try {
      const payload = { productId: p.id || p._id, name: p.name, price: p.price, image: p.image };
      const resp = await axios.post(`${API_URL}api/user/wishlist`, payload, { withCredentials: true });
      const user = resp.data?.user ?? resp.data;
      if (user) {
        dispatch(setUser(user));
      }
      setNotice("Added to wishlist");
      setTimeout(() => setNotice(null), 3000);
      setTimeout(() => setWishAnim(false), 700);
    } catch (err) {
      console.error('wishlist error', err);
      setNotice('Failed to add to wishlist');
      setTimeout(() => setNotice(null), 3000);
      setWishAnim(false);
    }
  };

  return (
    <div
      key={product.id}
      className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1"
    >
      <div className="h-96 bg-gray-300 relative overflow-hidden">
        <div className="image-overlay pointer-events-none" />
        <Image
          src={product.image || "/images/placeholder.png"}
          alt={product.name}
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />

        {/* confetti replaced by canvas-confetti; no DOM-based confetti here */}
      </div>

      <div className="p-8 text-center">
        {/* Launch badge */}
        {product.launchAt && (() => {
          const now = new Date();
          const la = new Date(product.launchAt as string);
          const ms = la.getTime() - now.getTime();
          if (ms > 0) {
            const hrs = Math.floor(ms / (1000 * 60 * 60));
            const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return (
              <div className="mb-4 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                Launching in {hrs}h {mins}m
              </div>
            );
          }
          return null;
        })()}
        <h3 className="font-playfair font-semibold text-2xl text-spdText mb-2">
          {product.name}
        </h3>

        <div className="text-sm text-gray-600 mb-4">
          {/* show brief description if available */}
          <span className="block truncate">{product.description ?? "High-quality product for global markets"}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center gap-2 mb-4" aria-hidden={product.rating == null}>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const r = Math.round(product.rating ?? 0);
              return (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < r ? "text-yellow-400" : "text-gray-300"}`}
                  viewBox="0 0 24 24"
                  fill={i < r ? "currentColor" : "none"}
                  stroke="currentColor"
                >
                  <path strokeWidth={0} d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.419 8.268L12 19.771 4.581 23.863 6 15.595 0 9.748l8.332-1.73z" />
                </svg>
              );
            })}
          </div>
          {product.reviewCount != null && (
            <span className="text-sm text-gray-500">{Number(product.rating ?? 0).toFixed(1)} • {product.reviewCount}</span>
          )}
        </div>

        <div className="mb-6">
          <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
        </div>

        <div className="flex justify-center gap-4 items-center">
          {product.launchAt && new Date(product.launchAt) > new Date() ? (
            <button
              onClick={() => wishlistProduct(product)}
              className={`flex items-center gap-3 bg-yellow-500 text-white font-opensans font-bold text-lg px-5 py-2 rounded-xl hover:brightness-95 transition transform ${wishAnim ? 'scale-110' : 'hover:-translate-y-0.5'} duration-300`}
              aria-label={`Wishlist ${product.name}`}
            >
              <svg className={`w-5 h-5 ${wishAnim ? 'text-white' : 'text-white/90'} transition-transform duration-300`} viewBox="0 0 24 24" fill={wishAnim ? 'currentColor' : 'none'} stroke="currentColor">
                <path strokeWidth={0} d="M12 21s-6.716-4.35-9.167-7.113C-1.167 9.12 3.5 3 8 6c1.68 1.172 2.9 3 4 3s2.32-1.828 4-3c4.5-3 9.167 3.12 5.167 7.887C18.716 16.65 12 21 12 21z" />
              </svg>
              <span>Add to Wishlist</span>
            </button>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className={`flex items-center gap-3 bg-[#368581] text-white font-opensans font-bold text-lg px-5 py-2 rounded-xl hover:brightness-95 transition-transform duration-300 ${loadingAdd ? 'scale-105 ring-4 ring-green-200/50' : 'hover:-translate-y-0.5'}`}
              disabled={loadingAdd}
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span>{loadingAdd ? "Adding..." : "Add to Cart"}</span>
            </button>
          )}

          <Link
            href={`/products/${product.id || product._id}`}
            className="inline-flex items-center text-[#368581] font-opensans font-bold text-lg px-4 py-2 rounded-xl border border-[#E6F6F3] hover:shadow-md transition-all duration-300"
          >
            <span>Check More</span>
            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
