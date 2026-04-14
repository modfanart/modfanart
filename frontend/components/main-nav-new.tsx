"use client";

import { ShoppingCart, User } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
  { label: "Home", href: "/" },
  { label: "For Artists", href: "/for-artists" },
  { label: "For Brands", href: "/for-brands" },
  { label: "About Us", href: "/about" },
];

export default function Navbar2({ activePath = "/" }: { activePath?: string }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4">
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/867e70cb1593c54c44ee08b54da6901cb70befa1_2_dwusbj"
            alt="MOD Logo"
            width={140}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

      {/* Nav links pill */}
      <div className="bg-white/90 backdrop-blur rounded-full px-6 py-2 flex items-center gap-6 text-sm font-medium">
        {navLinks.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className={`transition-colors hover:text-purple-500 ${
              activePath === href ? "text-purple-500" : "text-gray-800"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Icon buttons */}
      <div className="flex items-center gap-3">
        <Link href="/login">
        <button className="bg-white/90 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition-colors">
          <User size={18} className="text-gray-800" />
        </button>
        </Link>
        <Link href="/signup">
        <button className="bg-white/90 backdrop-blur rounded-full w-20 h-10 flex items-center justify-center text-sm font-medium hover:bg-white transition-colors">
          Sign Up
        </button>
        </Link>
      </div>

    </nav>
  );
}