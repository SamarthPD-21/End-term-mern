export default function Contact() {
  return (
    <div className="bg-veblyssBackground min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full">
            <div className="w-full h-full bg-gradient-to-b from-neutral-600 to-transparent"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-playfair font-bold text-4xl md:text-6xl text-veblyssSecondary mb-6"
            style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}>
            Contact Us
          </h1>
          <p className="font-opensans font-semibold text-xl md:text-2xl text-veblyssTextLight max-w-3xl"
            style={{ color: "#FFECE0", fontFamily: "Playfair Display" }}>
            Ready to explore our premium Indian exports? Let&apos;s build a
            partnership.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="bg-veblyssSecondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-veblyssBackground p-8 rounded-xl shadow-lg">
              <h2 className="font-playfair font-bold text-3xl text-veblyssPrimary mb-8"
                style={{color: "#368581", fontFamily: "Playfair Display"}}>
                Get In Touch
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-opensans font-semibold text-veblyssText mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block font-opensans font-semibold text-veblyssText mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-veblyssText mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-veblyssText mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-veblyssText mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-veblyssText mb-2">
                    Product Interest
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent">
                    <option value="">Select product category</option>
                    <option value="leather">Leather Products</option>
                    <option value="copper">Copper Products</option>
                    <option value="jewelry">Imitation Jewelry</option>
                    <option value="handicrafts">Indian Handicrafts</option>
                    <option value="sustainable">Sustainable Products</option>
                    <option value="all">All Categories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-veblyssText mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-veblyssPrimary focus:border-transparent resize-none"
                    placeholder="Tell us about your requirements, quantity, target markets, or any specific questions..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#368581] text-[#FAF9F6] hover:text-2xl font-opensans font-bold text-lg p-6 rounded-xl hover:bg-opacity-90 transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Company Information */}
            <div className="space-y-8">
              <div className="bg-veblyssBackground p-8 rounded-xl shadow-lg">
                <h2 className="font-playfair font-bold text-3xl text-veblyssPrimary mb-6"
                  style={{color: "#368581", fontFamily: "Playfair Display"}}>
                  VeBlyss Global Pvt Ltd
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-opensans font-bold text-lg text-veblyssText mb-2"
                      style={{color: "#368581", fontFamily: "Playfair Display"}}>
                      Head Office
                    </h3>
                    <p className="font-opensans text-veblyssText">
                      Bengaluru, Karnataka, India
                      <br />
                      The heart of traditional craftsmanship and modern
                      manufacturing
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-veblyssText mb-2"
                      style={{color: "#368581", fontFamily: "Playfair Display"}}>
                      Email
                    </h3>
                    <p className="font-opensans text-veblyssText">
                      info@veblyssglobal.com
                      <br />
                      exports@veblyssglobal.com
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-veblyssText mb-2"
                      style={{color: "#368581", fontFamily: "Playfair Display"}}>
                      Phone
                    </h3>
                    <p className="font-opensans text-veblyssText">
                      +91 XXX XXX XXXX
                      <br />
                      Available 9 AM - 6 PM IST
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-veblyssText mb-2"
                      style={{color: "#368581", fontFamily: "Playfair Display"}}>
                      Social Media
                    </h3>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="text-veblyssPrimary hover:text-opacity-80 transition-colors"
                      >
                        LinkedIn
                      </a>
                      <a
                        href="#"
                        className="text-veblyssPrimary hover:text-opacity-80 transition-colors"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-veblyssBackground p-8 rounded-xl shadow-lg">
                <h3 className="font-playfair font-bold text-2xl text-veblyssPrimary mb-4"
                  style={{color: "#368581", fontFamily: "Playfair Display"}}>
                  Global Markets We Serve
                </h3>
                <ul className="font-opensans text-veblyssText space-y-2">
                  <li>• European Union</li>
                  <li>• United States</li>
                  <li>• Middle East</li>
                  <li>• Africa</li>
                  <li>• Asia Pacific</li>
                </ul>
              </div>

              <div className="bg-veblyssBackground p-8 rounded-xl shadow-lg">
                <h3 className="font-playfair font-bold text-2xl text-veblyssPrimary mb-4">
                  Why Partner With Us?
                </h3>
                <ul className="font-opensans text-veblyssText space-y-2">
                  <li>• End-to-End Export Support</li>
                  <li>• Certified & Compliant Products</li>
                  <li>• Ethical & Sustainable Sourcing</li>
                  <li>• Custom Design & Private Label</li>
                  <li>• Timely Delivery & Quality Assurance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
