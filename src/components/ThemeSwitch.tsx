"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SunIcon = dynamic(() => import("./Icons").then((mod) => mod.SunIcon));
const MoonIcon = dynamic(() => import("./Icons").then((mod) => mod.MoonIcon));

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.button
      className="w-16 h-8 bg-gradient-to-r from-sky-400 to-blue-500 dark:from-indigo-500 dark:to-purple-600 rounded-full p-1 flex items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-indigo-400 shadow-lg transition-all duration-300 ease-in-out hover:scale-105"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
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
            <MoonIcon className="w-4 h-4 text-indigo-600" />
          ) : (
            <SunIcon className="w-4 h-4 text-amber-500" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
