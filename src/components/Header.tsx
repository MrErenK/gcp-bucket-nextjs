"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const CloudIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CloudIcon),
  { ssr: false },
);

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out
        ${isScrolled ? "bg-background/90 shadow-md" : "bg-background/50 backdrop-blur-sm"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <CloudIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-secondary transition-colors duration-200" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:text-primary transition-all duration-200">
              Cloud Storage
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
