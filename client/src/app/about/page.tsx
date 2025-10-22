import Link from "next/link";
import Image from "next/image";

export default function About() {
  const exportProducts = [
      { name: "Leather Goods", href: "/products/leather" },
      { name: "Copper Products", href: "/products/copper" },
      { name: "Imitation Jewelry", href: "/products/imitation-jewelry" },
      { name: "Handicrafts", href: "/products/handicrafts" },
      { name: "Sustainable Products", href: "/products/sustainable" },
    ];
  
    const trustFeatures = [
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
            <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 max-w-6xl"
              style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}>
              About VeBlyss Global Pvt Ltd
            </h1>
            <p className="font-opensans font-semibold text-xl md:text-2xl lg:text-3xl text-veblyssTextLight mb-12 max-w-4xl"
              style={{ color: "#FFECE0", fontFamily: "Open Sans" }}>
              Where Indian Craft Meets Global Standards
            </p>
          </div>
        </section>
  
        {/* About Us Section */}
        <section className="bg-veblyssSecondary py-16">
          <div className="mx-auto pl-6">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Content */}
              <div className="lg:w-1/2 space-y-8">
                <h2 className="font-bold text-4xl lg:text-5xl"
                style={{ color: "#368581", fontFamily: "Playfair Display" }}>
                  About us
                </h2>
                <div className="space-y-6">
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    At VeBlyss Global, we are committed to delivering handpicked,
                    high-quality products to global markets. From artisan-made
                    leather goods to eco-conscious lifestyle products, we blend
                    Indian tradition with international taste, ensuring every
                    shipment meets global quality, compliance, and design
                    expectations.
                  </p>
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    We specialize in the global trade of premium-quality Imitation
                    Jewelry, Genuine Leather Products, Handicrafts & Home Décor,
                    and Copper Products from India. Our team bridges tradition and
                    trend, ensuring that our clients receive products that are
                    stylish, durable, and competitively priced—backed by industry
                    certifications and international standards.
                  </p>
                </div>
              </div>
  
              {/* Image */}
              <div className="lg:w-1/2">
                <div className="w-full h-96 bg-gray-300 rounded-l-3xl"></div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Additional About Section */}
        <section className="bg-veblyssSecondary py-16">
          <div className="mx-auto pr-6">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Image */}
              <div className="lg:w-1/2">
                <div className="w-full h-96 bg-gray-300 rounded-r-3xl"></div>
              </div>
  
              {/* Content */}
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-6">
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    Our operations are guided by integrity, compliance,
                    sustainability, and customer-centrality, ensuring that every
                    transaction builds long-term trust and mutual growth.
                  </p>
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    Based in Bengaluru, India, the heart of traditional
                    craftsmanship and modern manufacturing, VeBlyss is driven by a
                    mission to make India&apos;s best products accessible to the world.
                    Our team specializes in curating, sourcing, and exporting
                    leather goods, copper ware, imitation jewelry, handicrafts,
                    and sustainable products to clients across the globe.
                  </p>
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    We don&apos;t just export products we deliver excellence,
                    compliance, and reliability in every container.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Vision & Mission Teaser */}
        <section className="bg-veblyssSecondary py-16">
          <div className="mx-auto pl-6">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Content */}
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-6">
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    Our vision at VeBlyss Global, our vision is to become a global
                    leader in exporting India&apos;s finest fashion, lifestyle, and
                    essential products. We are committed to showcasing the
                    richness of Indian craftsmanship and quality—delivering
                    unmatched trust, authenticity, and value to clients across the
                    world.
                  </p>
                  <p className="font-opensans text-lg text-veblyssText leading-relaxed">
                    Our mission is to aim to empower Indian artisans and
                    manufacturers by extending their reach to international
                    markets. By delivering high-quality, sustainable, and
                    ethically sourced products, we strive to represent the heart
                    of Indian heritage while building long-term partnerships
                    grounded in integrity and excellence.
                  </p>
                </div>
              </div>
  
              {/* Image */}
              <div className="lg:w-1/2">
                <div className="w-full h-96 bg-gray-300 rounded-l-3xl"></div>
              </div>
            </div>
          </div>
        </section>
  
        {/* What We Export */}
        <section className="bg-veblyssSecondary py-16">
          <div className="mx-auto px-4">
            <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-veblyssPrimary text-center mb-12"
                style={{ color: "#368581", fontFamily: "Playfair Display" }}>
              What we export
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {exportProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-veblyssBackground rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-56 bg-gray-300 relative overflow-hidden">
                    <div className="w-full h-full bg-gray-300"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-playfair font-semibold text-lg text-veblyssText mb-4">
                      {product.name}
                    </h3>
                    <Link
                      href={product.href}
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
  
        {/* Why Clients Trust VeBlyss */}
        <section className="bg-veblyssSecondary py-16 relative">
          <div className="absolute inset-0 opacity-25">
            <Image
              src="https://api.builder.io/api/v1/image/assets/TEMP/0ac27a7b365479a91ab00d23f9044cda020cccb7?width=2880"
              alt=""
              className="w-full h-full object-cover"
              fill
            />
          </div>
  
          <div className="relative z-10 container mx-auto px-4">
            <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-veblyssPrimary text-center mb-12"
                style={{ color: "#368581", fontFamily: "Playfair Display" }}>
              Why Clients Trust VeBlyss
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trustFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="font-playfair font-bold text-xl text-veblyssText text-center mb-4">
                    {feature.title}
                  </h3>
                  <p className="font-opensans text-veblyssText text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
}
