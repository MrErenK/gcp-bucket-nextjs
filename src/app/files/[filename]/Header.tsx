import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { Tooltip } from "@/components/ui/tooltip";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const HomeIcon = dynamic(() => import('@/components/Icons').then(mod => mod.HomeIcon), { ssr: false });
const ArrowLeftIcon = dynamic(() => import('@/components/Icons').then(mod => mod.ArrowLeftIcon), { ssr: false });
const CopyIcon = dynamic(() => import('@/components/Icons').then(mod => mod.CopyIcon), { ssr: false });
const DownloadIcon = dynamic(() => import('@/components/Icons').then(mod => mod.DownloadIcon), { ssr: false });
const XIcon = dynamic(() => import('@/components/Icons').then(mod => mod.XIcon), { ssr: false });
const MenuIcon = dynamic(() => import('@/components/Icons').then(mod => mod.MenuIcon), { ssr: false });

const Header = ({
  handleCopy,
  handleDownload,
  copied,
}: {
  handleCopy: () => void;
  handleDownload: () => void;
  copied: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10 rounded-full p-2";
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-card shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Tooltip content="Go to Home">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className={buttonClasses}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Tooltip>
          <Tooltip content="Go Back">
            <Button
              onClick={() => router.push("/files")}
              variant="ghost"
              className={buttonClasses}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Tooltip>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Tooltip content={copied ? "Copied!" : "Copy Link"}>
            <Button
              onClick={handleCopy}
              variant="ghost"
              className={buttonClasses}
              disabled={copied}
            >
              <CopyIcon className="w-5 h-5" />
              <span className="sr-only">Copy Link</span>
            </Button>
          </Tooltip>
          <Tooltip content="Download File">
            <Button
              onClick={handleDownload}
              variant="ghost"
              className={buttonClasses}
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="sr-only">Download</span>
            </Button>
          </Tooltip>
        </div>
        <div className="md:hidden">
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            className={buttonClasses}
          >
            {isMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-card shadow-md absolute top-full left-0 right-0 z-20"
          >
            <div className="p-4 space-y-3">
              <Button
                onClick={() => {
                  handleCopy();
                  setIsMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10"
                disabled={copied}
              >
                <CopyIcon className="w-5 h-5 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={() => {
                  handleDownload();
                  setIsMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download File
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
