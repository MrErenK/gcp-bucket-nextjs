import React from "react";
import { GithubIcon, TelegramIcon } from "@/components/Icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-background/90 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              File Manager
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              A cloud storage for developers.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            © 2024 MrErenK Cloud Storage. All rights reserved.
          </p>
          <div className="flex space-x-4 order-1 sm:order-2">
            <a
              href="https://github.com/MrErenK"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              <GithubIcon className="w-6 h-6" />
            </a>
            <a
              href="https://t.me/Mr_ErenK"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              <TelegramIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
