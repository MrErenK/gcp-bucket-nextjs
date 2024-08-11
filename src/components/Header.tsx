'use client'
import { useState, useEffect } from 'react';
import { CloudIcon } from "./Icons";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 w-full backdrop-blur z-40 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 shadow-md' : 'bg-background/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <CloudIcon className="w-8 h-8 text-primary hover:text-secondary transition-colors duration-200" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cloud Storage
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}