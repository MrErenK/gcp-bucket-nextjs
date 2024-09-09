import React from "react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const SearchIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.SearchIcon),
  { ssr: false },
);

interface SearchBarProps {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ searchTerm, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-4 sm:mb-6 md:mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
        <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-colors duration-200" />
      </div>
      <Input
        type="text"
        placeholder="Search files..."
        className="pl-10 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 w-full text-sm sm:text-base h-10 sm:h-12 rounded-full border-2 border-primary/20 bg-background focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-300 ease-in-out placeholder-muted-foreground/70 shadow-sm hover:shadow-md"
        value={searchTerm}
        onChange={onChange}
      />
    </div>
  );
}
