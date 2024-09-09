"use client";

import React from "react";
import { FileManager } from "@/components/FileManager";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { MaintenanceContent } from "@/components/MaintenanceContent";
import useMaintenance from "@/hooks/useMaintenance";

const ThemeSwitch = dynamic(
  () => import("@/components/ThemeSwitch").then((mod) => mod.default),
  { ssr: false },
);
const FileIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileIcon),
  { ssr: false },
);
const GithubIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.GithubIcon),
  { ssr: false },
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
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
          <div className="flex items-center">
            <FileIcon
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary mr-2 sm:mr-3 md:mr-4"
              aria-hidden="true"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              File Manager
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <ThemeSwitch />
            <Button
              variant="outline"
              className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            >
              <a
                href="https://github.com/MrErenK/gcp-bucket-nextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full"
                aria-label="View project on GitHub"
              >
                <GithubIcon
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  aria-hidden="true"
                />
                <span className="text-sm sm:text-base">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
        <section className="bg-card rounded-xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 border border-primary/10">
          <h2 className="sr-only">File Management Interface</h2>
          <FileManager />
        </section>
      </main>
      <Footer />
    </div>
  );
}
