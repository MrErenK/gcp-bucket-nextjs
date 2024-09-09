"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SunIcon = dynamic(() => import("./Icons").then((mod) => mod.SunIcon));
const MoonIcon = dynamic(() => import("./Icons").then((mod) => mod.MoonIcon));

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleThemeChange = useCallback(() => {
    if (!isChanging) {
      setIsChanging(true);
      setTheme(theme === "dark" ? "light" : "dark");
      setTimeout(() => setIsChanging(false), 500); // Debounce for 500ms
    }
  }, [isChanging, setTheme, theme]);

  if (!mounted) return null;

  return (
    <motion.button
      className="w-16 h-8 bg-gradient-to-r from-gray-200 to-gray-600 dark:from-gray-800 dark:to-gray-600 rounded-full p-1 flex items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
      onClick={handleThemeChange}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      disabled={isChanging}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white dark:bg-black shadow-md flex items-center justify-center"
        animate={{
          x: theme === "dark" ? 32 : 0,
        }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        <motion.div
          animate={{
            rotate: theme === "dark" ? 0 : 180,
          }}
          transition={{ duration: 0.5 }}
        >
          {theme === "dark" ? (
            <MoonIcon className="w-4 h-4 text-white" />
          ) : (
            <SunIcon className="w-4 h-4 text-black" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
