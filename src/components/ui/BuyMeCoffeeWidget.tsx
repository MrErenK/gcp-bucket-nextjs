"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

export default function BuyMeCoffeeWidget() {
  const { theme, systemTheme } = useTheme();
  const [widgetColor, setWidgetColor] = useState("#FF5733");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const updateWidgetColor = useCallback(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(currentTheme === "dark" ? "--bmc-dark" : "--bmc-light")
      .trim();
    setWidgetColor(color);
  }, [theme, systemTheme]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      // Show/hide based on scroll direction and position
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (isScrollingDown) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    updateWidgetColor();
  }, [theme, systemTheme, updateWidgetColor]);

  useEffect(() => {
    if (document.getElementById("bmc-wbtn")) return;

    const script = document.createElement("script");
    const scriptAttributes = {
      "data-name": "BMC-Widget",
      "data-id": "MrErenK",
      "data-description": "Support me on Buy me a coffee!",
      "data-message":
        "Thank you for visiting and using my service. Buy me a coffee if you wish to.",
      "data-color": widgetColor,
      "data-position": "Right",
      "data-x_margin": "18",
      "data-y_margin": "18",
    };

    Object.entries(scriptAttributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.async = true;

    script.onload = () => {
      const evt = new Event("DOMContentLoaded");
      window.dispatchEvent(evt);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const widgetButton = document.getElementById("bmc-wbtn");
      widgetButton?.remove();
    };
  }, [widgetColor]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      #bmc-wbtn {
        bottom: 15px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        transform: ${isVisible ? "translateY(0)" : "translateY(100px)"} !important;
        opacity: ${isVisible ? "1" : "0"} !important;
      }
      #bmc-wbtn:hover {
        transform: ${isVisible ? "translateY(-2px)" : "translateY(100px)"} !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
      }
      #bmc-wbtn + div {
        bottom: 15px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        transform: ${isVisible ? "translateY(0)" : "translateY(100px)"} !important;
        opacity: ${isVisible ? "1" : "0"} !important;
      }
      @media (max-width: 768px) {
        #bmc-wbtn {
          transform: scale(0.9) ${isVisible ? "translateY(0)" : "translateY(100px)"} !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, [isVisible]);

  return null;
}
