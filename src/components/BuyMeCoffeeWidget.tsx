"use client";

import React, { useEffect } from "react";

export default function BuyMeCoffeeWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "MrErenK");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute(
      "data-message",
      "Thank you for visiting and using my service. You can buy me a coffee if you wish to.",
    );
    script.setAttribute("data-color", "#FF813F");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;

    // Call window on load to show the image
    script.onload = function () {
      var evt = document.createEvent("Event");
      evt.initEvent("DOMContentLoaded", false, false);
      window.dispatchEvent(evt);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(script);
      const widgetButton = document.getElementById("bmc-wbtn");
      if (widgetButton) {
        widgetButton.remove();
      }
    };
  }, []);

  // Add some CSS to ensure the widget is visible
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
