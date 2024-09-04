import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const GithubIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.GithubIcon),
  { ssr: false },
);
const TelegramIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.TelegramIcon),
  { ssr: false },
);
const HeartIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.HeartIcon),
  { ssr: false },
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-background/90 backdrop-blur-sm border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <Link href="/">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                File Manager
              </h2>
            </Link>
            <p className="mt-2 text-muted-foreground text-sm">
              A cloud storage solution for developers.
            </p>
          </div>
          <nav className="space-y-4 md:space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/files"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  All Files
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/MrErenK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-6 h-6" />
              </a>
              <a
                href="https://t.me/Mr_ErenK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
                aria-label="Telegram"
              >
                <TelegramIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MrErenK Cloud Storage. All rights
            reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center">
            Made with <HeartIcon size={16} className="text-red-500 mx-1" /> by
            MrErenK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
