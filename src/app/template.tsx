"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateProps {
  children: React.ReactNode;
  className?: string;
  animationDuration?: number;
}

const Template: React.FC<TemplateProps> = ({
  children,
  className = "",
  animationDuration = 0.3,
}) => {
  const variants = {
    hidden: { y: 20 },
    visible: { y: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={React.useId()}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants}
        transition={{ ease: "easeOut", duration: animationDuration }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Template);
