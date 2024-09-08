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
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 lg:mb-12 space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="flex items-center">
            <FileIcon
              className="w-10 h-10 sm:w-12 sm:h-12 text-primary mr-3 sm:mr-4"
              aria-hidden="true"
            />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              File Manager
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
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
                <GithubIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
        <section className="bg-card rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-primary/10">
          <h2 className="sr-only">File Management Interface</h2>
          <FileManager />
        </section>
      </main>
      <Footer />
    </div>
  );
}
