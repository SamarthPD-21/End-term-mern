"use client";
import React from "react";
import Image from "next/image";


function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full h-[680px] overflow-hidden"
    >
      {/* Render hero image directly from public/about */}
      <div className="absolute inset-0 -z-10">
        {/* Use existing public assets so hero loads in production */}
        <Image src="/home/about.png" alt="About hero" fill className="object-cover" priority />
      </div>

      {/* subtle gradient overlay to match tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-transparent flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="flex flex-col items-center justify-center text-center py-16 -mt-4 md:-mt-8 lg:-mt-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#AFD8D1] leading-tight drop-shadow-lg">
                About Spd Global Pvt Ltd
              </h1>
              <p className="text-[24px] text-white/90 mt-6 max-w-2xl">
                Where Indian Craft Meets Global Standards
              </p>
            </div>
        </div>
      </div>
    </section>
  );
}
function WhoWeAreSection() {
  return (
    <section id="about" className="py-16 lg:pr-16">
      <div className="max-w-screen">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:max-w-[50%] lg:w-[50%] lg:p-0 p-4 w-full">
            <Image
              src="/home/about.png"
              alt="Spd Global Artisan Heritage"
              height={706}
              width={460}
              className="lg:rounded-r-3xl rounded-3xl w-full h-[250px] md:h-[500px] object-cover shadow-lg"
            />
          </div>

          <div className="flex-1 px-2 text-center flex flex-col md:pr-14 gap-4 md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--button-red)]">
              Who we are
            </h2>
            <p className="mt-4 m-4 text-justify text-[16px] text-gray-700">
              At Spd Global, we are committed to delivering handpicked,
              high-quality products to global markets. From artisan-made leather
              goods to Eco-conscious lifestyle products, we blend{" "}
              <strong>Indian tradition with international taste</strong>,
              ensuring every shipment meets global{" "}
              <strong>quality, compliance, and design standards.</strong>
            </p>
            <p className="mt-4 m-4 text-justify text-[16px] text-gray-700">
              Based in Bengaluru, India – the heart of traditional craftsmanship
              and modern manufacturing – our team bridges{" "}
              <strong>heritage and trend</strong>. We specialize in curating,
              sourcing, and exporting{" "}
              <strong>
                leather goods, copper ware, imitation jewelry, handicrafts, and
                sustainable products
              </strong>{" "}
              to clients worldwide.
            </p>
            <p className="mt-4 mx-4 text-justify text-[16px] text-gray-700">
              We don’t just export products{" "}
              <strong>
                we deliver excellence, reliability, and compliance in every
                container.
              </strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionAndMissionSection() {
  return (
    <section>
      <div className="max-w-screen flex flex-col items-center py-16 md:px-6">
        <div className="flex flex-col items-center justify-center container gap-8">
          <h2 className="font-poppins md:text-4xl text-3xl text-[var(--button-red)] font-bold">
            Our Vision & Mission
          </h2>
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 md:mr-12 md:ml-16 items-center justify-center md:items-start">
            <div className="text-gray-700 md:max-w-[50%] md:p-0 p-4 text-left flex flex-col gap-12">
              <h3 className="font-extrabold text-2xl md:text-start text-center">Our Vision</h3>

              <p className="text-[16px] text-justify">
                To be a global leader in exporting Indian-crafted fashion,
                lifestyle, and essential products — showcasing the best of
                quality and craftsmanship while delivering trust and value to
                every client.
              </p>
            </div>
            <div className="text-gray-700 md:max-w-[50%] md:p-0 p-4 pr-0 text-left flex flex-col gap-12">
              <h3 className="font-extrabold text-center md:text-start text-2xl">Our Mission</h3>

              <ul className="list-disc list-inside space-y-2 text-[16px] ">
                <li>
                  To empower Indian artisans and manufacturers by giving them
                  global reach.
                </li>
                <li>
                  To deliver high-quality, sustainable, and ethically sourced
                  products from India.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketsWeServeSection() {
  return (
    <section>
      <div className="max-w-screen flex flex-col items-center py-16 px-6">
        <div className="flex flex-col items-center justify-center container gap-8">
          <h2 className="font-poppins md:text-4xl text-[26px] text-[var(--button-red)] font-bold">
            Markets We Serve
          </h2>
          <div className="flex flex-col w-full items-center">
            <Image
              src="/images/background.png"
              alt="Map and markets we serve - international export destinations"
              height={400}
              width={650}
              className="w-[80%] md:w-[50%] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const certifications: string[] = [
    "Import Export Code (IEC)",
    "APEDA/ Spices Board/ Tea Board/ FIEO",
    "GST, DGFT, MSME Udyam",
    "CE, RoHS, FDA, ISO, REACH",
    "PhytoSanitary Certificate",
    "Certifiate of Origin (COO)",
  ];
  return (
    <section>
      <div className="max-w-screen flex flex-col items-center py-16 px-6">
        <div className="flex flex-col items-center justify-center container gap-8">
          <h2 className="font-poppins md:text-4xl text-[26px] text-center text-[var(--button-red)] font-bold">
            Certifications & Legal Compliance
          </h2>
          <div className="flex flex-col w-full items-center">
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((text, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded-lg text-center text-lg font-medium text-gray-800 shadow-md"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <section className="min-h-screen">
      <HeroSection />
      <div className="relative z-10 bg-gradient-to-b from-[#FFECE0] via-[#EAB4B4] to-[#FFECE0]">
        <WhoWeAreSection />
        <VisionAndMissionSection />
        <MarketsWeServeSection />
        <CertificationsSection />
      </div>
    </section>
  );
}
