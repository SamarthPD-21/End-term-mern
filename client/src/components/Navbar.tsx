"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Vision & Mission", path: "/vision-mission" },
    { name: "Products", path: "/products" },
    { name: "Contact", path: "/contact" },
    { name: "Profile", path: "/profile" },
    { name: "Cart", path: "/cart" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-11/12 px-4">
      {/* Outer Rounded Container */}
      <div className="bg-[#4c8380] rounded-xl shadow-md flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/images/logo.png"
            alt="VeBlyss Global Logo"
            width={40}
            height={40}
          />
          <div className="leading-tight text-white">
            <h1 className="text-lg font-bold tracking-wide">SPD GLOBAL</h1>
            <p className="text-xs font-light italic">
              Lifestyle. Fashion. Home & Beyond
            </p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex space-x-4 text-white">
          {navLinks.map((link) => (
            <div key={link.name} className="flex items-center">
              <Link
                href={link.path}
                className={`transition-colors ${
                  pathname === link.path
                    ? "font-bold"
                    : "font-normal hover:font-bold"
                }`}
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="sm:hidden mt-2 bg-[#4f8685] rounded-xl shadow-md flex flex-col items-center py-4 space-y-3 text-white">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`${
                pathname === link.path
                  ? "font-bold"
                  : "font-normal hover:font-bold"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
