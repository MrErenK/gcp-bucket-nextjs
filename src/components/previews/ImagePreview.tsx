import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomInIcon, ZoomOutIcon, XIcon } from "@/components/Icons";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setScale(1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const handleZoom = (zoomIn: boolean) => {
    setScale((prevScale) => (zoomIn ? prevScale * 1.2 : prevScale / 1.2));
  };

  return (
    <>
      <div className="bg-card p-4 rounded-lg shadow-md max-w-sm mx-auto">
        <div className="relative">
          <img
            src={src}
            alt={alt}
            className="w-full h-auto max-h-[40vh] sm:max-h-[50vh] object-contain cursor-pointer rounded-md transition-transform hover:scale-[1.02]"
            onClick={openModal}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{alt}</p>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] z-60"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <motion.img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain"
                style={{ scale }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleZoom(true)}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Zoom in"
                >
                  <ZoomInIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleZoom(false)}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Zoom out"
                >
                  <ZoomOutIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close modal"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
