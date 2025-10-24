"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  useCurrentUser();

  const productCategories = [
    {
      name: "Leather Products",
      href: "/products/leather",
      image: "/home/Leather.png",
      description:
        "Premium quality bags, wallets & accessories crafted from ethically sourced leather.",
    },
    {
      name: "Copper Products",
      href: "/products/copper",
      image: "/home/Copper.png",
      description:
        "Traditional and modern copper-ware for kitchen, décor, and wellness that's food-safe.",
    },
    {
      name: "Imitation Jewelry",
      href: "/products/imitation-jewelry",
      image: "/home/imitation.png",
      description:
        "Stylish, high-quality artificial jewellery necklaces, bangles, earrings, sets, and more.",
    },
    {
      name: "Indian Handicrafts",
      href: "/products/handicrafts",
      image: "/home/Handicrafts.png",
      description:
        "Handcrafted art pieces from skilled artisans — woodwork, pottery, textiles, and more.",
    },
    {
      name: "Sustainable Products",
      href: "/products/sustainable",
      image: "/home/Sustainable.png",
      description:
        "Eco-conscious goods including reusable items, natural materials, & bio-products.",
    },
  ];

  const features = [
    {
      title: "End-to-End Export Support",
      description: "From documentation to doorstep delivery",
    },
    {
      title: "Certified & Compliant",
      description: "REACH, RoHS, CE, FSSAI, BIS (where applicable)",
    },
    {
      title: "Custom Design & Private Label",
      description: "Tailored for global retailers and brands",
    },
    {
      title: "Ethical & Sustainable Sourcing",
      description: "Supporting artisans and eco-friendly practices",
    },
    {
      title: "Eco-Friendly Packaging",
      description: "Prioritising sustainability at every step",
    },
    {
      title: "Timely Delivery & Quality Assurance",
      description: "Trusted across EU, US, Middle East, and Africa",
    },
  ];

  
  return (
    <div>
      {/*Hero Section*/}
      <section>
        <div className="relative w-full h-[640px] md:h-[700px] overflow-hidden">
          <Image
            src="/home/hero.png"
            alt="SPD Global Logo"
            className="object-cover"
            fill
            priority
          />
          {/* subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/10" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#AFD8D1] leading-tight drop-shadow-lg"
            >
              Welcome to SPD Global
            </h1>
            <p className="text-[20px] text-white/90 mt-6 max-w-4xl mb-12">
              From handcrafted elegance to sustainable essentials – delivered
              globally
            </p>
            <Link
              href="/products"
              className="text-xl md:text-2xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg font-bold"
              style={{
                backgroundColor: "#792727",
                color: "#FAF9F6",
                fontFamily: "Open Sans",
              }}
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/*Welcome*/}
      <section className="py-16" style={{ backgroundColor: "#FFECE0" }}>
        <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-8">
        <div className="md:pr-0 pr-4">
          <div className="">
            <Image
              src="/home/about.png"
              alt="Spd Global Artisan Heritage"
              height={460}
              width={706}
              className="rounded-r-3xl w-full md:h-[360px] h-[240px] object-cover shadow-lg"
            />
          </div>
        </div>
        <div className="flex mx-4 flex-col md:flex-row items-center gap-8">

          <div className="flex-1 px-2 text-center flex flex-col md:pr-14 gap-4 md:text-left">
            <h2 className="text-[26px] md:text-3xl font-bold text-[#792727]">
              Exporting India&apos;s Finest to the World
            </h2>
            <p className="mt-4 text-justify text-gray-700">
              Based in Bengaluru, Spd Global connects India&apos;s artisan
              heritage with international markets. We specialize in ethically
              sourced, premium exports including imitation jewelry, copperware,
              leather goods, handicrafts, and sustainable lifestyle products.
            </p>
            <div className="mt-6">
              <Link href="/about"
              className="text-xl md:text-2xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg font-bold"
              style={{
                backgroundColor: "#792727",
                color: "#FAF9F6",
                fontFamily: "Open Sans",
              }}>
                Read More
              </Link>
            </div>
          </div>
        </div>
      </div>
      </section>
      

      {/* Product Categories */}
      <section
        className="py-16 relative"
        style={{ backgroundColor: "#FFECE0" }}
      >
        <div className="relative z-10 mx-auto px-4">
          <h2
            className="text-[26px] md:text-4xl font-bold text-center text-[#792727] "
          >
            Product Categories
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:gap-20 md:gap-14 gap-4 items-start justify-items-center">
            {productCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: "#FAF9F6" }}
              >
                <div className="h-56 bg-white relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={560}
                    height={320}
                  />
                </div>
                <div className="p-6 text-center">
                  <h3
                    className="font-semibold text-2xl mb-3"
                    style={{ color: "#222", fontFamily: "Playfair Display" }}
                  >
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">{category.description}</p>

                  <Link
                    href={category.href}
                    className="inline-block text-sm px-5 py-2 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-semibold"
                    style={{
                      backgroundColor: "#792727",
                      color: "#FAF9F6",
                      fontFamily: "Open Sans",
                    }}
                  >
                    Check More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      {/* What Makes Us Different */}
      <section className="py-16" style={{ backgroundColor: "#FFECE0" }}>
        <div className="container mx-auto px-4">
          <h2
            className="font-bold text-4xl lg:text-5xl text-center mb-12"
            style={{ color: "#792727", fontFamily: "Playfair Display" }}
          >
            What Makes Us Different
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: "#FAF9F6" }}
              >
                <h3
                  className="font-bold text-xl text-center mb-4"
                  style={{ color: "#222", fontFamily: "Playfair Display" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-center"
                  style={{ color: "#222", fontFamily: "Open Sans" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16" style={{ backgroundColor: "#FFECE0" }}>
        <div className="mx-auto pl-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Content */}
            <div className="lg:w-1/2 space-y-8">
              <h2
                className="text-[26px] md:text-start text-center md:text-3xl font-bold text-[#792727]"
              >
                Let&apos;s Build a Global Partnership
              </h2>
              <p
                className="text-xl md:mt-8 md:text-start text-center text-gray-700"
              >
                Reach out today to explore our curated collections and export
                services tailored for your market.
              </p>
              <Link
                href="/products"
                className="inline-block text-xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-bold"
                style={{
                  backgroundColor: "#792727",
                  color: "#FAF9F6",
                  fontFamily: "Open Sans",
                }}
              >
                Contact Us Now
              </Link>
            </div>
              
            {/* Image */}
            <div className="lg:w-1/2">
              <Image
                src="https://api.builder.io/api/v1/image/assets/TEMP/662e930b131ad97aa5ae647780816e34303eeb2d?width=1442"
                alt="Global Partnership"
                className="w-full h-96 object-cover rounded-l-3xl"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
