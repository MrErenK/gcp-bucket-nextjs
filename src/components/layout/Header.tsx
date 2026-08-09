"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  CloudIcon,
  FileIcon,
  InfoIcon,
  ArrowLeftIcon,
  MenuIcon,
  XIcon,
} from "@/components/ui/Icons";

type IconType = React.ComponentType<{ className?: string }>;

export interface HeaderAction {
  icon: IconType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export interface HeaderProps {
  /** Section name shown next to the brand, e.g. "Admin Panel". */
  title?: string;
  titleIcon?: IconType;
  /** Set false on pages that only need the brand and actions. */
  showNav?: boolean;
  /** Renders a back arrow pointing at this route. */
  backHref?: string;
  /** Page-specific buttons, collapsed into the menu on small screens. */
  actions?: HeaderAction[];
}

const NAV_LINKS = [
  { href: "/files", label: "Files", icon: FileIcon },
  { href: "/info", label: "Info", icon: InfoIcon },
];

export function Header({
  title,
  titleIcon: TitleIcon,
  showNav = true,
  backHref,
  actions = [],
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  const hasMenu = showNav || actions.length > 0;

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md",
        "transition-shadow duration-300",
        isScrolled ? "shadow-sm" : "shadow-none",
      )}
    >
      <div className="container mx-auto flex h-16 items-center gap-2 px-4 sm:px-6">
        {backHref && (
          <Tooltip text="Go back">
            <Link
              href={backHref}
              aria-label="Go back"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                "text-muted-foreground transition-colors duration-200",
                "hover:bg-accent hover:text-foreground",
              )}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          </Tooltip>
        )}

        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 rounded-lg px-1 py-1.5"
        >
          <CloudIcon className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110" />
          <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
            Cloud Storage
          </span>
        </Link>

        {title && (
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <span aria-hidden className="h-5 w-px bg-border" />
            {TitleIcon && <TitleIcon className="h-4 w-4 shrink-0" />}
            <span className="truncate text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {showNav && (
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                      "transition-colors duration-200 hover:bg-accent",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {actions.length > 0 && (
            <div className="hidden items-center gap-1 md:flex">
              {actions.map((action) => (
                <Tooltip key={action.label} text={action.tooltip ?? action.label}>
                  <Button
                    onClick={action.onClick}
                    disabled={action.disabled}
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="sr-only">{action.label}</span>
                  </Button>
                </Tooltip>
              ))}
            </div>
          )}

          <div className="ml-1 hidden sm:block">
            <ThemeSwitch />
          </div>

          {hasMenu && (
            <Button
              onClick={() => setIsMenuOpen((open) => !open)}
              variant="ghost"
              size="icon"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className={cn("rounded-lg", showNav ? "md:hidden" : "sm:hidden")}
            >
              {isMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "overflow-hidden border-t bg-background",
              showNav ? "md:hidden" : "sm:hidden",
            )}
          >
            <div className="container mx-auto space-y-1 px-4 py-3 sm:px-6">
              {showNav &&
                NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      "transition-colors duration-200 hover:bg-accent",
                      pathname === href
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}

              {actions.map((action) => (
                <Button
                  key={action.label}
                  onClick={() => {
                    action.onClick();
                    setIsMenuOpen(false);
                  }}
                  disabled={action.disabled}
                  variant="ghost"
                  block
                  className="justify-start gap-3 rounded-lg px-3 py-2.5"
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              ))}

              <div className="flex justify-end pt-2 sm:hidden">
                <ThemeSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
