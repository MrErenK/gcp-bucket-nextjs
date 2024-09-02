import React from "react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const SearchIcon = dynamic(() => import('@/components/Icons').then(mod => mod.SearchIcon), { ssr: false });

interface SearchBarProps {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ searchTerm, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-muted-foreground transition-colors duration-200" />
      </div>
      <Input
        type="text"
        placeholder="Search files..."
        className="pl-11 pr-4 py-3 w-full text-base h-12 rounded-full border-2 border-primary/20 bg-background focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-300 ease-in-out placeholder-muted-foreground/70"
        value={searchTerm}
        onChange={onChange}
      />
    </div>
  );
}
