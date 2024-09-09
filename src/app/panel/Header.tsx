import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ThemeSwitch = dynamic(
  () => import("@/components/ThemeSwitch").then((mod) => mod.default),
  {
    ssr: false,
  },
);
const HomeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.HomeIcon),
  {
    ssr: false,
  },
);

export const Header = () => {
  const router = useRouter();
  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  return (
    <header className="sticky top-0 z-10 w-full bg-card shadow-md px-4 py-4 backdrop-blur-md shadow-lg h-18 rounded-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className={buttonClasses}
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <ThemeSwitch />
      </div>
    </header>
  );
};
