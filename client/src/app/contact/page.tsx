"use client";

import Image from "next/image";
import { toast as rtToast } from 'react-toastify';

export default function Contact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section using site hero image for consistent look */}
      <section className="relative h-96 md:h-[560px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/contact.png" alt="Contact hero" fill className="object-cover" priority />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-transparent"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-playfair font-bold text-4xl md:text-6xl text-white mb-6"
            style={{ fontFamily: "Playfair Display" }}>
            Contact Us
          </h1>
          <p className="font-opensans font-semibold text-lg md:text-xl text-white/90 max-w-3xl"
            style={{ fontFamily: "Open Sans" }}>
            Ready to explore our premium Indian exports? Let&apos;s build a partnership.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white/90 p-8 rounded-xl shadow-lg">
              <h2 className="font-playfair font-bold text-3xl text-[#368581] mb-8"
                style={{ fontFamily: "Playfair Display" }}>
                Get In Touch
              </h2>

              {/* contact form: removed Company Name field per request and added submit handler */}
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                // build payload
                const payload = {
                  firstName: String(fd.get('firstName') || '').trim(),
                  lastName: String(fd.get('lastName') || '').trim(),
                  email: String(fd.get('email') || '').trim(),
                  phone: String(fd.get('phone') || '').trim(),
                  productInterest: String(fd.get('productInterest') || '').trim(),
                  message: String(fd.get('message') || '').trim(),
                  source: window.location.pathname,
                };

                if (!payload.firstName || !payload.email || !payload.message) {
                  // minimal client validation
                  rtToast.error('Please provide First name, Email and Message');
                  return;
                }

                try {
                  const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
                  const url = API ? `${API}/api/contact` : '/api/contact';
                  const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include',
                  });
                  if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    rtToast.error(j?.error || 'Failed to send message');
                    return;
                  }
                  form.reset();
                  rtToast.success('Message sent — we will get back to you shortly.');
                } catch (err) {
                  console.error('contact submit failed', err);
                  rtToast.error('Failed to send message');
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-opensans font-semibold text-gray-700 mb-2">First Name *</label>
                    <input name="firstName" type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block font-opensans font-semibold text-gray-700 mb-2">Last Name</label>
                    <input name="lastName" type="text" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent" placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent" placeholder="Enter your email address" />
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input name="phone" type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent" placeholder="Enter your phone number" />
                </div>

                <div>
                  <label className="block font-opensans font-semibold text-gray-700 mb-2">Product Interest</label>
                  <select name="productInterest" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent">
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
                  <label className="block font-opensans font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea name="message" required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#368581] focus:border-transparent resize-none" placeholder="Tell us about your requirements, quantity, target markets, or any specific questions..."></textarea>
                </div>

                <button type="submit" className="w-full bg-[#368581] text-[#FAF9F6] font-opensans font-bold text-lg p-4 rounded-xl hover:bg-opacity-90 transition-all duration-300">Send Message</button>
              </form>
            </div>

            {/* Company Information */}
            <div className="space-y-8">
              <div className="bg-white/90 p-8 rounded-xl shadow-lg">
                <h2 className="font-playfair font-bold text-3xl text-[#368581] mb-6"
                  style={{ fontFamily: "Playfair Display" }}>
                  SPD Global Pvt Ltd
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-opensans font-bold text-lg text-[#368581] mb-2"
                      style={{ fontFamily: "Playfair Display" }}>
                      Head Office
                    </h3>
                    <p className="font-opensans text-gray-700">
                      Bengaluru, Karnataka, India
                      <br />
                      The heart of traditional craftsmanship and modern
                      manufacturing
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-[#368581] mb-2"
                      style={{ fontFamily: "Playfair Display" }}>
                      Email
                    </h3>
                    <p className="font-opensans text-gray-700">
                      info@spdglobal.com
                      <br />
                      exports@spdglobal.com
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-[#368581] mb-2"
                      style={{ fontFamily: "Playfair Display" }}>
                      Phone
                    </h3>
                    <p className="font-opensans text-gray-700">
                      +91 XXX XXX XXXX
                      <br />
                      Available 9 AM - 6 PM IST
                    </p>
                  </div>

                  <div>
                    <h3 className="font-opensans font-bold text-lg text-gray-700 mb-2"
                      style={{ fontFamily: "Playfair Display" }}>
                      Social Media
                    </h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-[#368581] hover:text-opacity-80 transition-colors">
                        LinkedIn
                      </a>
                      <a href="#" className="text-[#368581] hover:text-opacity-80 transition-colors">
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 p-8 rounded-xl shadow-lg">
                <h3 className="font-playfair font-bold text-2xl text-[#368581] mb-4"
                  style={{ fontFamily: "Playfair Display" }}>
                  Global Markets We Serve
                </h3>
                <ul className="font-opensans text-gray-700 space-y-2">
                  <li>• European Union</li>
                  <li>• United States</li>
                  <li>• Middle East</li>
                  <li>• Africa</li>
                  <li>• Asia Pacific</li>
                </ul>
              </div>

              <div className="bg-white/90 p-8 rounded-xl shadow-lg">
                <h3 className="font-playfair font-bold text-2xl text-[#368581] mb-4">
                  Why Partner With Us?
                </h3>
                <ul className="font-opensans text-gray-700 space-y-2">
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
