"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getApiKeyDescription } from "@/lib/apiKeyAuth";

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

  const { data: session } = useSession();
  const [apiKeyDescription, setApiKeyDescription] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchApiKeyDescription = async () => {
      if (session?.user.apiKey) {
        const description = await getApiKeyDescription(session.user.apiKey);
        setApiKeyDescription(description);
      }
    };
    fetchApiKeyDescription();
  }, [session?.user.apiKey]);

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
          {session ? (
            <div className="flex items-center space-x-2">
              <span className="text-primary">
                {(() => {
                  const messages = [
                    "Welcome back",
                    "Hello there",
                    "Nice to see you",
                    "Greetings",
                    "Howdy",
                    "Glad you're here",
                    "Ready to work?",
                  ];
                  const randomMessage =
                    messages[Math.floor(Math.random() * messages.length)];
                  return `${randomMessage}, ${apiKeyDescription}!`;
                })()}
              </span>
              <Link
                href="/files/manage"
                className="text-primary hover:text-primary/80 transition-colors duration-300 relative group flex items-center"
              >
                <span className="hidden sm:inline">Manage Your Files</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-primary">Welcome guest!</span>
              <Link
                href="/auth/signin"
                className="text-primary hover:text-primary/80 transition-colors duration-300"
              >
                Sign In
              </Link>
              <span className="text-primary">to start managing your files</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
