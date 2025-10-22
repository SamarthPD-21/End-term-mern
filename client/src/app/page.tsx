"use client";

import useCurrentUser from "@/hooks/useCurrentUser";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  useCurrentUser();

  const productCategories = [
    { name: "Leather Products", href: "/products/leather" },
    { name: "Copper Products", href: "/products/copper" },
    { name: "Imitation Jewelry", href: "/products/imitation-jewelry" },
    { name: "Indian Handicrafts", href: "/products/handicrafts" },
    { name: "Sustainable Products", href: "/products/sustainable" },
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

  const markets = [
    "European Union",
    "United States",
    "Middle East",
    "Africa",
    "Asia Pacific",
  ];

  return (
    <div>
      {/*Hero Section*/}
      <section>
        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <Image
            src="/images/placeholder.png"
            alt="VeBlyss Global Logo"
            className="object-cover sm:static sm:w-full sm:h-auto sm:object-cover"
            fill
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1
              className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 max-w-6xl"
              style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}
            >
              Exporting India&apos;s Finest to the World
            </h1>
            <p
              className="font-semibold text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl"
              style={{ color: "#FAF9F6", fontFamily: "Open Sans" }}
            >
              From handcrafted elegance to sustainable essentials – delivered
              globally
            </p>
            <Link
              href="/products"
              className="text-xl md:text-2xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 shadow-lg font-bold"
              style={{
                backgroundColor: "#368581",
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
        <div className="mx-auto pr-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image */}
            <div className="lg:w-1/2">
              <Image
                src="/images/placeholder.png"
                alt="Description of image"
                width={500}
                height={300}
                className="w-full h-96 object-cover rounded-r-3xl"
              />
            </div>

            {/* Content */}
            <div className="lg:w-1/2 space-y-8 p-3">
              <h2
                className="font-bold text-4xl lg:text-5xl"
                style={{ color: "#368581", fontFamily: "Playfair Display" }}
              >
                Welcome to VeBlyss Global
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "#222", fontFamily: "Open Sans" }}
              >
                Based in Bengaluru, VeBlyss Global specializes in ethically
                sourced, premium Indian exports including imitation jewelry,
                copper-ware, leather goods, and sustainable products for global
                markets...
              </p>
              <Link
                href="/about"
                className="inline-block text-xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-bold"
                style={{
                  backgroundColor: "#368581",
                  color: "#FAF9F6",
                  fontFamily: "Open Sans",
                }}
              >
                Read more
              </Link>
            </div>
          </div>
        </div>
      </section>
      

      {/* Product Categories */}
      <section
        className="py-16 relative"
        style={{ backgroundColor: "#FFECE0" }}
      >
        <div className="absolute inset-0 opacity-25">
          <Image
            src='/images/placeholder.png'
            alt=""
            className="w-full h-full object-cover"
            width={800}
            height={600}
          />
        </div>

        <div className="relative z-10 mx-auto px-4">
          <h2
            className="font-bold text-4xl lg:text-5xl text-center mb-12"
            style={{ color: "#368581", fontFamily: "Playfair Display" }}
          >
            Product Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {productCategories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: "#FAF9F6" }}
              >
                <div className="h-56 p-3 bg-white relative overflow-hidden">
                  <Image
                    src="/images/placeholder.png"
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={400}
                    height={300}
                  />
                </div>
                <div className="p-6 text-center">
                  <h3
                    className="font-semibold text-xl mb-4"
                    style={{ color: "#222", fontFamily: "Playfair Display" }}
                  >
                    {category.name}
                  </h3>
                  <Link
                    href={category.href}
                    className="inline-block text-sm px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-bold"
                    style={{
                      backgroundColor: "#368581",
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
            style={{ color: "#368581", fontFamily: "Playfair Display" }}
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

      {/* Markets We Serve */}
      <section className="py-16" style={{ backgroundColor: "#FFECE0" }}>
        <div className="container mx-auto px-4">
          <h2
            className="font-bold text-4xl lg:text-5xl text-center mb-12"
            style={{ color: "#368581", fontFamily: "Playfair Display" }}
          >
            Markets We Serve
          </h2>

          <div className="flex overflow-x-auto space-x-8 pb-4">
            {markets.map((market, index) => (
              <div key={market} className="flex-shrink-0 w-72 text-center">
                <div className="h-28 bg-gray-300 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src={
                      index % 2 === 0
                        ? "https://api.builder.io/api/v1/image/assets/TEMP/5bd98620bf0a51915f69da3e5dcaef76593599a9?width=576"
                        : "https://api.builder.io/api/v1/image/assets/TEMP/196fe813a9d622fb79ada3987e37ff5734ed983c?width=576"
                    }
                    alt={market}
                    className="w-full h-full object-cover"
                    width={400}
                    height={400}
                  />
                </div>
                <h3
                  className="font-bold text-xl"
                  style={{ color: "#222", fontFamily: "Playfair Display" }}
                >
                  {market}
                </h3>
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
                className="font-bold text-4xl lg:text-5xl"
                style={{ color: "#368581", fontFamily: "Playfair Display" }}
              >
                Let&apos;s Build a Global Partnership
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "#222", fontFamily: "Open Sans" }}
              >
                Reach out today to explore our curated collections and export
                services tailored for your market.
              </p>
              <Link
                href="/contact"
                className="inline-block text-xl px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 font-bold"
                style={{
                  backgroundColor: "#368581",
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
