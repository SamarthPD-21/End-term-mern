'use client'
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";


export default function LeatherProducts() {
  const [notice, setNotice] = useState<string | null>(null)

  const products = [
    { name: "Premium Leather Bags", id: "prod-1", price: 4999 },
    { name: "Handcrafted Wallets", id: "prod-2", price: 1299 },
    { name: "Leather Belts", id: "prod-3", price: 899 },
    { name: "Travel Accessories", id: "prod-4", price: 2199 },
    { name: "Leather Jackets", id: "prod-5", price: 8999 },
    { name: "Executive Portfolios", id: "prod-6", price: 1799 },
  ];

  const whyChooseFeatures = [
    "Private Label Services Available",
    "Skilled Handcrafted Detailing",
    "International Durability Standards",
  ];

  const idealFor = [
    "Fashion Retailers",
    "Corporate Gifts",
    "Luxury Boutiques",
    "E-commerce Stores",
    "Wholesale Distributors",
    "Export Companies",
  ];

  const relatedCategories = [
    { name: "Copper Products", href: "/products/copper" },
    { name: "Imitation Jewelry", href: "/products/imitation-jewelry" },
    { name: "Handicrafts", href: "/products/handicrafts" },
    { name: "Sustainable Products", href: "/products/sustainable" },
  ];

  return (
    <div className="bg-veblyssBackground">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-b from-neutral-600 to-transparent"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-playfair font-bold text-4xl md:text-6xl lg:text-7xl text-veblyssSecondary mb-6 max-w-6xl"
            style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}>
            Leather Products
          </h1>
          <p className="font-opensans font-semibold text-xl md:text-2xl lg:text-3xl text-veblyssTextLight mb-12 max-w-4xl"
            style={{ color: "#FAF9F6", fontFamily: "Open Sans" }}>
            Crafted with care, tailored for global appeal.
          </p>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="font-playfair font-normal text-4xl text-veblyssText mb-8"
              style={{ color: "#368581", fontFamily: "Playfair Display" }}>
              Premium Indian leather goods combining traditional craftsmanship
              with modern design, perfect for global markets seeking quality and
              authenticity.
            </h2>
          </div>
        </div>
      </section>

      {/* Our Product Range */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <h2
            className="font-playfair font-bold text-4xl lg:text-5xl text-veblyssPrimary text-center mb-12"
            style={{ color: "#368581", fontFamily: "Playfair Display" }}
          >
            Our Product Range
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} setNotice={setNotice} />
            ))}
          </div>
        </div>
      </section>
      

      {/* Why Choose Our Leather Products */}
      <section className="bg-veblyssSecondary py-16 relative">
        <div className="absolute inset-0 opacity-25">
          <Image
            src="https://api.builder.io/api/v1/image/assets/TEMP/24210383a5bf97fbabd00a6a6380b78f6db84648?width=2880"
            alt=""
            className="w-full h-full object-cover"
            layout="fill"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-veblyssPrimary text-center mb-12 "
            style={{color: "#368581", fontFamily: "Playfair Display"}}>
            Why Choose Our Leather Products
          </h2>

          <div className="flex flex-wrap justify-center gap-8">
            {whyChooseFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-playfair font-bold text-xl text-veblyssText text-center">
                  {feature}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-veblyssPrimary text-center mb-12"
            style={{color: "#368581", fontFamily: "Playfair Display"}}>
            Ideal For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {idealFor.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-playfair font-bold text-xl text-veblyssText text-center">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Product Categories */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedCategories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="h-64 bg-gray-300 relative overflow-hidden">
                  <div className="w-full h-full bg-gray-300">
                    <Image
                      src='/images/placeholder.png'
                      alt={category.name}
                      className="object-cover w-full h-full"
                      layout="fill"
                    />
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-playfair font-semibold text-lg text-veblyssText mb-4">
                    {category.name}
                  </h3>
                  <Link
                    href={category.href}
                    className="inline-block text-veblyssTextLight font-opensans font-bold text-sm px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all duration-300"
                    style={{ backgroundColor: "#368581", color: "#FAF9F6" }}
                  >
                    Check More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {notice && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg p-3 shadow-lg">
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
