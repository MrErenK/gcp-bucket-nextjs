import React, { useState, useEffect } from "react";

interface FontPreviewProps {
  src: string;
  fontName: string;
}

export function FontPreview({ src, fontName }: FontPreviewProps) {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    const font = new FontFace(fontName, `url(${src})`);
    font
      .load()
      .then(() => {
        document.fonts.add(font);
        setFontLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading font:", err);
      });
  }, [src, fontName]);

  const sampleText = "The quick brown fox jumps over the lazy dog";
  const sampleSizes = [16, 24, 36, 48];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Font Preview: {fontName}
      </p>
      {fontLoaded ? (
        <div>
          {sampleSizes.map((size) => (
            <p
              key={size}
              style={{ fontFamily: fontName, fontSize: `${size}px` }}
              className="mb-4 text-gray-800 dark:text-gray-200"
            >
              {size}px: {sampleText}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Loading font...</p>
      )}
      <div className="mt-4">
        <a
          href={src}
          download
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download Font
        </a>
      </div>
    </div>
  );
}
