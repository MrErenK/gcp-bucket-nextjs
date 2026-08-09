"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { FileManager } from "@/components/file/FileManager";
import { GithubIcon, FileManagerIcon } from "@/components/ui/Icons";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card border border-border",
          duration: 3000,
        }}
      />
      <Header />

      <main className="grow container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 sm:gap-6"
              >
                <div className="group p-2 sm:p-3 bg-card rounded-xl border">
                  <FileManagerIcon className="w-10 h-10 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110" />
                </div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-0"
                >
                  File Manager
                </motion.h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className={cn("group text-sm sm:text-base")}
                  >
                    <a
                      href="https://github.com/MrErenK/gcp-bucket-nextjs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 text-foreground hover:text-foreground dark:text-foreground dark:hover:text-foreground"
                    >
                      <GithubIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-medium">GitHub</span>
                    </a>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="sr-only">File Management Interface</h2>
                <FileManager />
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
