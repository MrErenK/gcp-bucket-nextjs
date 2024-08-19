import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ZoomInIcon, ZoomOutIcon, XIcon } from "@/components/Icons";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setZoom(1);
    x.set(0);
    y.set(0);
  }, [setIsModalOpen, setZoom, x, y]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const handleZoom = (zoomIn: boolean) => {
    setZoom((prevZoom) => {
      const newZoom = zoomIn ? prevZoom * 1.2 : prevZoom / 1.2;
      return Math.max(1, Math.min(newZoom, 5)); // Limit zoom between 1x and 5x
    });
  };

  const handleDragEnd = () => {
    if (imageRef.current && containerRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      if (rect.width <= containerRect.width) {
        x.set(0);
      } else {
        x.set(Math.max(Math.min(x.get(), 0), containerRect.width - rect.width));
      }

      if (rect.height <= containerRect.height) {
        y.set(0);
      } else {
        y.set(
          Math.max(Math.min(y.get(), 0), containerRect.height - rect.height),
        );
      }
    }
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
              ref={containerRef}
              className="relative max-w-[90vw] max-h-[90vh] z-60 overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                ref={imageRef}
                src={src}
                alt={alt}
                className="max-w-none max-h-none object-contain cursor-move"
                style={{
                  width: `${100 * zoom}%`,
                  height: `${100 * zoom}%`,
                  x,
                  y,
                }}
                drag
                dragConstraints={containerRef}
                dragElastic={0}
                onDragEnd={handleDragEnd}
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
