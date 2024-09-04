"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function BuyMeCoffeeWidget() {
  const { theme, systemTheme } = useTheme();
  const [widgetColor, setWidgetColor] = useState("#FF813F"); // Default color

  useEffect(() => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(currentTheme === "dark" ? "--bmc-dark" : "--bmc-light")
      .trim();
    setWidgetColor(color);
  }, [theme, systemTheme]);

  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "MrErenK");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute(
      "data-message",
      "Thank you for visiting and using my service. Buy me a coffee if you wish to.",
    );
    script.setAttribute("data-color", widgetColor);
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;

    script.onload = function () {
      var evt = document.createEvent("Event");
      evt.initEvent("DOMContentLoaded", false, false);
      window.dispatchEvent(evt);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      const widgetButton = document.getElementById("bmc-wbtn");
      if (widgetButton) {
        widgetButton.remove();
      }
    };
  }, [widgetColor]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
#bmc-wbtn {
bottom: 15px !important;
}
#bmc-wbtn + div {
bottom: 15px !important;
}
`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
