import React, { useState, useEffect } from "react";

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="relative">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[60vh] object-contain cursor-pointer"
            onClick={openModal}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{alt}</p>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
          <div className="relative max-w-[90vw] max-h-[90vh] z-60">
            <img
              src={src}
              alt={alt}
              className={`max-w-full max-h-full object-contain transition-all duration-300 'scale-150'`}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={closeModal}
                className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
