import React from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "./Icons";

interface SearchBarProps {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ searchTerm, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Search files..."
        className="pl-10 pr-4 py-2 w-full text-sm sm:text-base h-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        value={searchTerm}
        onChange={onChange}
      />
    </div>
  );
}
