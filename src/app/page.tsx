import React from "react";
import { FileManager } from "@/components/FileManager";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { GithubIcon, FileIcon } from "@/components/Icons";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
          <div className="flex items-center">
            <FileIcon className="w-12 h-12 text-primary mr-4" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">
              File Manager
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ThemeSwitch />
            <Button
              variant="outline"
              asChild
              className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            >
              <a
                href="https://github.com/MrErenK/gcp-bucket-nextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <GithubIcon className="w-5 h-5 mr-2" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-primary/10">
          <FileManager />
        </div>
      </main>
      <Footer />
    </div>
  );
}
