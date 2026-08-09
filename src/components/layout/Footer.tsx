"use client";
import React from "react";
import Link from "next/link";
import {
  GithubIcon,
  TelegramIcon,
  HeartIcon,
  FileIcon,
  CloudIcon,
  InfoIcon,
} from "@/components/ui/Icons";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const FooterLink = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <motion.li whileHover={{ x: 4 }}>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
      >
        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span>{children}</span>
      </Link>
    </motion.li>
  );

  const SocialLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: any;
    label: string;
  }) => (
    <motion.a
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative p-2 rounded-xl transition-all duration-300"
      aria-label={label}
    >
      <div className="absolute inset-0 bg-accent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
    </motion.a>
  );

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, padding: 0 }}
            animate={{ opacity: 1, padding: 16 }}
            className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start"
          >
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl hover:bg-accent transition-all duration-500">
                <div className="relative">
                  <CloudIcon className="relative w-6 h-6 sm:w-8 sm:h-8 text-primary transition-all duration-500 group-hover:scale-125 group-hover:rotate-[-15deg] mb-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">Cloud Storage</h2>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed font-medium text-center md:text-left">
              A modern-looking cloud storage solution built for rom developers,
              offering fast file upload and download speeds.
            </p>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start pt-5"
          >
            <h3 className="text-lg sm:text-xl font-bold">Quick Links</h3>
            <ul className="space-y-2 w-full flex flex-col items-center md:items-start">
              <FooterLink href="/files" icon={FileIcon}>
                All Files
              </FooterLink>
              <FooterLink href="/info" icon={InfoIcon}>
                Information
              </FooterLink>
            </ul>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 sm:space-y-4 flex flex-col items-center md:items-start pt-5"
          >
            <h3 className="text-lg sm:text-xl font-bold">Connect</h3>
            <div className="flex gap-3 sm:gap-4 justify-center md:justify-start w-full">
              <SocialLink
                href="https://github.com/MrErenK"
                icon={GithubIcon}
                label="GitHub"
              />
              <SocialLink
                href="https://t.me/Mr_ErenK"
                icon={TelegramIcon}
                label="Telegram"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 pt-4 border-t"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/90 text-center sm:text-left">
              © {new Date().getFullYear()} MrErenK Cloud Storage. All rights
              reserved.
            </p>
            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
              <span className="text-muted-foreground/90 font-medium">
                Made with
              </span>
              <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse hover:animate-bounce" />
              <span className="text-muted-foreground/90 font-medium">by</span>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://github.com/MrErenK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/90 font-bold hover:underline decoration-2 underline-offset-4"
              >
                MrErenK
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
