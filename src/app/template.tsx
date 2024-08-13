"use client";

import React, { useId } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface TemplateProps {
  children: React.ReactNode;
  className?: string;
  animationDuration?: number;
  variants?: Variants;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Template: React.FC<TemplateProps> = ({
  children,
  className = "",
  animationDuration = 0.3,
  variants = defaultVariants,
}) => {
  const id = useId();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={{
          ease: "easeInOut",
          duration: animationDuration,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Template);
