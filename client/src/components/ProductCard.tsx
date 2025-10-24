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
}

export default function ProductCard({
  product,
  setNotice,
}: {
  product: Product;
  setNotice: (message: string | null) => void;
}) {
  const [loadingAdd, setLoadingAdd] = useState(false);
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

      console.log(user.cartdata);
      console.log(product)
      setNotice("Added to cart");
    } catch (err) {
      console.error("addToCart error:", err);
      setNotice("Add to cart failed");
    } finally {
      setLoadingAdd(false);
      setTimeout(() => setNotice(null), 3000);
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
      </div>

      <div className="p-8 text-center">
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

        <div className="flex justify-center gap-4">
          <button
            onClick={() => addToCart(product)}
            className="bg-[#368581] text-white font-opensans font-bold text-lg px-6 py-3 rounded-xl hover:brightness-95 transition-all duration-300 disabled:opacity-60"
            disabled={loadingAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {loadingAdd ? "Adding..." : "Add to Cart"}
          </button>

          <Link
            href={`/products/${product.id || product._id}`}
            className="inline-block text-[#368581] font-opensans font-bold text-lg px-4 py-3 rounded-xl border border-[#E6F6F3] hover:shadow-md transition-all duration-300"
          >
            Check More
          </Link>
        </div>
      </div>
    </div>
  );
}
