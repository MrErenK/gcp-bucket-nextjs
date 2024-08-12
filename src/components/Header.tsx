"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CloudIcon } from "./Icons";
import Link from "next/link";

const useScrollInfo = () => {
  const [scrollInfo, setScrollInfo] = useState({
    scrollY: 0,
    scrollDirection: "up",
    isAtTop: true,
  });

  const updateScrollInfo = useCallback(() => {
    setScrollInfo((prevState) => {
      const currentScrollY = window.pageYOffset;
      const isAtTop = currentScrollY < 10;
      const scrollDirection =
        currentScrollY > prevState.scrollY ? "down" : "up";

      return {
        scrollY: currentScrollY,
        scrollDirection: isAtTop ? "up" : scrollDirection,
        isAtTop,
      };
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateScrollInfo);
    return () => window.removeEventListener("scroll", updateScrollInfo);
  }, [updateScrollInfo]);

  return scrollInfo;
};

export function Header() {
  const { scrollDirection, isAtTop } = useScrollInfo();
  const [isContentScrollable, setIsContentScrollable] = useState(true);

  useEffect(() => {
    const checkContentScrollable = () => {
      setIsContentScrollable(document.body.scrollHeight > window.innerHeight);
    };

    checkContentScrollable();
    window.addEventListener("resize", checkContentScrollable);
    return () => window.removeEventListener("resize", checkContentScrollable);
  }, []);

  return (
    <header
      className={`sticky top-0 w-full backdrop-blur z-40 transition-all duration-300 ease-in-out
        ${!isAtTop && isContentScrollable ? (scrollDirection === "down" ? "-translate-y-full" : "translate-y-0") : "translate-y-0"}
        ${!isAtTop ? "bg-background/80 shadow-md" : "bg-background/50"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <CloudIcon className="w-8 h-8 text-primary hover:text-secondary transition-colors duration-200" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <Link href="/">Cloud Storage</Link>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
