"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleThemeChange = useCallback(() => {
    if (!isChanging) {
      setIsChanging(true);
      setTheme(theme === "dark" ? "light" : "dark");

      // Add haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      setTimeout(() => setIsChanging(false), 500);
    }
  }, [isChanging, setTheme, theme]);

  if (!mounted) return null;

  return (
    <motion.button
      className={cn(
        "relative w-16 h-8 rounded-full p-1",
        "flex items-center justify-start",
        "focus:outline-hidden focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "bg-muted border shadow-xs transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      onClick={handleThemeChange}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      disabled={isChanging}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-accent opacity-0 transition-opacity duration-300"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      <motion.div
        className={cn(
          "w-6 h-6 rounded-full shadow-xs",
          "flex items-center justify-center",
          "relative z-10",
          "bg-background border",
        )}
        animate={{
          x: theme === "dark" ? 32 : 0,
          rotate: theme === "dark" ? 360 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "dark" ? 0 : 180,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {theme === "dark" ? (
            <MoonIcon className="w-4 h-4 text-foreground" />
          ) : (
            <SunIcon className="w-4 h-4 text-foreground" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
