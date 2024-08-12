import React from "react";
import { FileDownloader } from "@/components/FileDownloader";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { GithubIcon, FileIcon } from "@/components/Icons";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <div className="flex items-center mb-4 sm:mb-0">
            <FileIcon className="w-10 h-10 text-primary mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              File Manager
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <Button
              variant="outline"
              asChild
              className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href="https://github.com/MrErenK/gcp-bucket-nextjs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <GithubIcon className="w-5 h-5 mr-2" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          <FileDownloader />
        </div>
      </main>
      <Footer />
    </div>
  );
}
