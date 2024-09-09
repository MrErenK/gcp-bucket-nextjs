"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MaintenanceContent } from "@/components/MaintenanceContent";
import useMaintenance from "@/hooks/useMaintenance";
import Loading from "./loading";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const ThemeSwitch = dynamic(
  () => import("@/components/ThemeSwitch").then((mod) => mod.default),
  { ssr: false },
);
const FileManagerIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileManagerIcon),
  { ssr: false },
);
const GithubIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.GithubIcon),
  { ssr: false },
);
const Header = dynamic(
  () => import("@/components/Header").then((mod) => mod.default),
  { ssr: false, loading: () => <Loading isLoading={true} /> },
);
const FileManager = dynamic(
  () => import("@/components/FileManager").then((mod) => mod.FileManager),
  { ssr: false, loading: () => <LoadingIndicator loading="file manager" /> },
);
const Footer = dynamic(
  () => import("@/components/Footer").then((mod) => mod.default),
  { ssr: false, loading: () => <LoadingIndicator loading="footer" /> },
);

export default function Home() {
  const { isMaintenance } = useMaintenance();

  if (isMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="w-full max-w-2xl">
          <MaintenanceContent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 md:mb-16 space-y-6 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center">
            <FileManagerIcon
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-primary mr-3 sm:mr-4 pt-1"
              aria-hidden="true"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary leading-tight pt-4">
              File Manager
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <ThemeSwitch />
            <Button
              variant="outline"
              className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto text-lg py-3 px-6"
            >
              <a
                href="https://github.com/MrErenK/gcp-bucket-nextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full"
                aria-label="View project on GitHub"
              >
                <GithubIcon
                  className="w-6 h-6 sm:w-6 sm:h-6 mr-3"
                  aria-hidden="true"
                />
                <span className="text-lg sm:text-lg font-semibold">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
        <section className="bg-card rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border-2 border-primary/30 transition-all duration-300 hover:shadow-3xl">
          <h2 className="sr-only">File Management Interface</h2>
          <FileManager />
        </section>
      </main>
      <Footer />
    </div>
  );
}
