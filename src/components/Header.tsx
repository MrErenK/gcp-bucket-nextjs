"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out
          ${isScrolled ? "bg-background/95 shadow-lg backdrop-blur-sm" : "bg-background/70 backdrop-blur-sm"}
        `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <CloudIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary group-hover:text-secondary transition-colors duration-300 transform group-hover:scale-110" />
            <h1 className="text-sm sm:text-lg font-extrabold text-primary group-hover:text-secondary transition-colors duration-300 flex items-center">
              <span className="hidden sm:inline leading-none pt-4">
                Cloud Storage
              </span>
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
