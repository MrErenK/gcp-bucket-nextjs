"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 500); // Hide after transition completes

      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 h-1 bg-primary z-50"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          exit={{ opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
};

export default Loading;
