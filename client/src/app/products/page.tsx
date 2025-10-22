'use client';

import Image from "next/image";
import Link from "next/link";

export default function Products() {
  const productCategories = [
      {
        name: "Leather Products",
        href: "/products/leather",
        description:
          "Premium leather goods crafted with traditional techniques and modern design for global markets.",
        image:
          '/images/placeholder.png',
      },
      {
        name: "Copper Products",
        href: "/products/copper",
        description:
          "Pure copper items combining Ayurvedic wisdom with contemporary functionality for health-conscious consumers.",
        image:
          '/images/placeholder.png',
      },
      {
        name: "Imitation Jewelry",
        href: "/products/imitation-jewelry",
        description:
          "Elegant Indian jewelry designs capturing timeless beauty with contemporary fashion trends.",
        image:
          '/images/placeholder.png',
      },
      {
        name: "Indian Handicrafts",
        href: "/products/handicrafts",
        description:
          "Authentic handicrafts preserving centuries-old traditions and showcasing master artisan skills.",
        image:
          '/images/placeholder.png',
      },
      {
        name: "Sustainable Products",
        href: "/products/sustainable",
        description:
          "Eco-friendly products made from sustainable materials supporting environmental conservation.",
        image:
          '/images/placeholder.png',
      },
    ];
  
    const features = [
      {
        title: "End-to-End Export Support",
        description:
          "Complete documentation and logistics support from factory to your doorstep",
      },
      {
        title: "Quality Assurance",
        description:
          "Rigorous quality checks and international certifications for all products",
      },
      {
        title: "Custom Solutions",
        description:
          "Private labeling, custom designs, and tailored solutions for your market",
      },
      {
        title: "Global Compliance",
        description:
          "REACH, RoHS, CE, FSSAI, BIS certified products meeting international standards",
      },
    ];
  
    return (
      <div>
        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden">
          <div className="absolute inset-0">
          <div className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-b from-neutral-600 to-transparent"></div>
          </div>
        </div>
  
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1
              className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 max-w-6xl transition-all duration-700 ease-out"
              style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}
            >
              Our Product Range
            </h1>
            <p
              className="font-semibold text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl transition-all duration-700 ease-out delay-200"
              style={{ color: "#FAF9F6", fontFamily: "Open Sans" }}
            >
              Discover India&apos;s finest exports across five premium categories
            </p>
          </div>
        </section>
  
        {/* Product Categories Grid */}
        <section className="py-20" style={{ backgroundColor: "#FFECE0" }}>
          <div className="container mx-auto px-4">
            <h2
              className="font-bold text-4xl lg:text-5xl text-center mb-16 transition-all duration-700 ease-out"
              style={{ color: "#368581", fontFamily: "Playfair Display" }}
            >
              Explore Our Categories
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {productCategories.map((category, index) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group block transform hover:scale-105 transition-all duration-500 ease-out hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.8s ease-out forwards",
                  }}
                >
                  <div
                    className="rounded-2xl shadow-lg overflow-hidden h-full"
                    style={{ backgroundColor: "#FAF9F6" }}
                  >
                    <div className="h-64 relative overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        layout="fill"
                        objectFit="cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-8">
                      <h3
                        className="font-bold text-2xl mb-4 group-hover:text-opacity-80 transition-all duration-300"
                        style={{
                          color: "#368581",
                          fontFamily: "Playfair Display",
                        }}
                      >
                        {category.name}
                      </h3>
                      <p
                        className="leading-relaxed mb-6 group-hover:text-opacity-90 transition-all duration-300"
                        style={{ color: "#222", fontFamily: "Open Sans" }}
                      >
                        {category.description}
                      </p>
                      <div
                        className="inline-flex items-center text-lg font-semibold group-hover:translate-x-2 transition-transform duration-300"
                        style={{ color: "#368581", fontFamily: "Open Sans" }}
                      >
                        Explore Products
                        <svg
                          className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
  
        {/* Why Choose Us */}
        <section className="py-20" style={{ backgroundColor: "#FFECE0" }}>
          <div className="container mx-auto px-4">
            <h2
              className="font-bold text-4xl lg:text-5xl text-center mb-16 transition-all duration-700 ease-out"
              style={{ color: "#368581", fontFamily: "Playfair Display" }}
            >
              Why Choose VeBlyss Global
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-8 text-center transform hover:scale-105 hover:shadow-xl transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: "#FAF9F6",
                    animationDelay: `${index * 150}ms`,
                    animation: "fadeInUp 0.8s ease-out forwards",
                  }}
                >
                  <h3
                    className="font-bold text-xl mb-4 transition-all duration-300"
                    style={{ color: "#368581", fontFamily: "Playfair Display" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="leading-relaxed transition-all duration-300"
                    style={{ color: "#222", fontFamily: "Open Sans" }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Call to Action */}
        <section className="py-20" style={{ backgroundColor: "#368581" }}>
          <div className="container mx-auto px-4 text-center">
            <h2
              className="font-bold text-4xl lg:text-5xl mb-8 transition-all duration-700 ease-out"
              style={{ color: "#FAF9F6", fontFamily: "Playfair Display" }}
            >
              Ready to Partner With Us?
            </h2>
            <p
              className="text-xl mb-12 max-w-3xl mx-auto transition-all duration-700 ease-out delay-200"
              style={{ color: "#FAF9F6", fontFamily: "Open Sans" }}
            >
              Discover how VeBlyss Global can help you access India&apos;s finest
              products with complete export support and global compliance.
            </p>
            <Link
              href="/contact"
              className="inline-block text-xl px-12 py-5 rounded-2xl font-bold transform hover:scale-105 hover:shadow-xl transition-all duration-500 ease-out"
              style={{
                backgroundColor: "#FAF9F6",
                color: "#368581",
                fontFamily: "Open Sans",
              }}
            >
              Get Started Today
            </Link>
          </div>
        </section>
  
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  
}
