"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Keep Profile out of the main navLinks so it doesn't appear in mobile dropdown
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Vision & Mission", path: "/vision-mission" },
    { name: "Products", path: "/products" },
    { name: "Contact", path: "/contact" },
    { name: "Cart", path: "/cart" },
  ];

  // get user from redux; name may be null
  const user = useSelector((state: RootState) => state.user);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-11/12 px-4">
      {/* Outer Rounded Container */}
      <div className="bg-[#4c8380] rounded-xl shadow-md flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-3 animate-float">
          <Image
            src="/images/logo.png"
            alt="SPD Global Logo"
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
        {/* Right-side container: links (desktop) + profile + mobile hamburger */}
        <div className="ml-auto flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-6 text-white">
            {navLinks.map((link) => (
              <div key={link.name} className="flex items-center">
                <Link
                  href={link.path}
                  // keep weight stable to avoid layout shift; underline shows active state
                  className={`transition-colors nav-underline ${
                    pathname === link.path ? "font-semibold active" : "font-medium"
                  } animate-fade-in`}
                >
                  {link.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Right-side: Profile circle (always visible) */}
          <Link href="/profile" className="mr-2">
            <div title={user?.name ?? "Profile"} className="animate-pop hover:scale-105">
              {user?.profileImage ? (
                // Use plain img to avoid next/image remote config issues
                <img
                  src={user.profileImage}
                  alt={user.name ?? "profile"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="profile-circle">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : (user?.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="sm:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="sm:hidden mt-2 bg-[#4f8685] rounded-xl shadow-md flex flex-col items-center py-4 space-y-3 text-white animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              // mobile: use consistent weight; no hover bold to avoid shifting
              className={`${pathname === link.path ? "font-semibold" : "font-medium"}`}
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
