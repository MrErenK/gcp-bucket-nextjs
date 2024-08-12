"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "./Icons";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.button
      className="w-16 h-8 bg-sky-100 dark:bg-slate-700 rounded-full p-1 flex items-center transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-indigo-400 z-30"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      animate={{
        backgroundColor: theme === "dark" ? "#334155" : "#e0f2fe",
      }}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
        animate={{
          x: theme === "dark" ? 32 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {theme === "dark" ? (
          <MoonIcon className="w-4 h-4 text-indigo-600" />
        ) : (
          <SunIcon className="w-4 h-4 text-amber-500" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
