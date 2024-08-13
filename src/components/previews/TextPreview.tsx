import React, { useState, useRef, useEffect } from "react";
import { CopyIcon, CheckIcon } from "../Icons";
import { motion, AnimatePresence } from "framer-motion";

interface TextPreviewProps {
  content: string;
  maxHeight?: string;
}

export function TextPreview({ content, maxHeight = "60vh" }: TextPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showFade, setShowFade] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      setShowFade(preRef.current.scrollHeight > preRef.current.clientHeight);
    }
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative bg-card rounded-lg shadow-md overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <motion.button
          onClick={handleCopy}
          className="p-2 rounded-full bg-background text-foreground hover:bg-accent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Copy to clipboard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence initial={false} mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CheckIcon className="w-5 h-5 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CopyIcon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <pre
        ref={preRef}
        className="p-6 overflow-x-auto whitespace-pre-wrap text-sm font-mono text-foreground scrollbar-thin scrollbar-thumb-accent scrollbar-track-background"
        style={{ maxHeight }}
      >
        {content}
      </pre>
      {showFade && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      )}
    </div>
  );
}
