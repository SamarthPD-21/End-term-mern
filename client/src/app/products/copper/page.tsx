import Image from "next/image";
import Link from "next/link";

export default function CopperProducts() {
  const products = [
    { name: "Copper Cookware Sets", id: 1 },
    { name: "Decorative Vessels", id: 2 },
    { name: "Copper Water Bottles", id: 3 },
    { name: "Traditional Utensils", id: 4 },
    { name: "Copper Planters", id: 5 },
    { name: "Artisan Sculptures", id: 6 },
  ];

  const whyChooseFeatures = [
    "Pure Copper Manufacturing",
    "Traditional Craftsmanship",
    "Food-Safe Certifications",
  ];

  const idealFor = [
    "Health & Wellness Stores",
    "Kitchen Equipment Retailers",
    "Ayurvedic Practitioners",
    "Home Décor Boutiques",
    "Export Businesses",
    "Wellness Centers",
  ];

  const relatedCategories = [
    { name: "Leather Products", href: "/products/leather" },
    { name: "Imitation Jewelry", href: "/products/imitation-jewelry" },
    { name: "Handicrafts", href: "/products/handicrafts" },
    { name: "Sustainable Products", href: "/products/sustainable" },
  ];

  return (
    <div className="bg-veblyssBackground">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-b from-neutral-600 to-transparent"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-playfair font-bold text-4xl md:text-6xl lg:text-7xl text-veblyssSecondary mb-6 max-w-6xl"
            style={{color:"#ffece0", fontFamily: "Playfair Display"}}>
            Copper Products
          </h1>
          <p className="font-opensans font-semibold text-xl md:text-2xl lg:text-3xl text-veblyssTextLight mb-12 max-w-4xl"
            style={{color:"#FAF9F6", fontFamily: "Open Sans"}}>
            Pure copper craftsmanship for health and heritage.
          </p>
        </div>
      </section>

      {/* Description Section */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="font-playfair font-normal text-4xl text-veblyssText mb-8"
              style={{color:"#368581", fontFamily: "Playfair Display"}}>
              Authentic Indian copper products combining traditional Ayurvedic
              wisdom with modern functionality, perfect for health-conscious
              global markets.
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

          {/* Dynamic Grid for Any Number of Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="h-96 bg-gray-300 relative overflow-hidden">
                  <div className="w-full h-full bg-gray-300">
                    <Image
                      src='/images/placeholder.png'
                      alt={product.name}
                      className="object-cover w-full h-full"
                      layout="fill"
                    />
                  </div>
                </div>
            
                {/* Product Details */}
                <div className="p-8 text-center">
                  <h3 className="font-playfair font-semibold text-2xl text-veblyssText mb-6">
                    {product.name}
                  </h3>
                  <button
                    className="bg-veblyssPrimary text-veblyssTextLight font-opensans font-bold text-lg px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-300"
                    style={{ backgroundColor: "#368581", color: "#FAF9F6" }}
                  >
                    Check More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Copper Products */}
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
    </div>
  );
}
