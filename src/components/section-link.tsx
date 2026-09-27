"use client";

import { usePathname } from "next/navigation";
import { NavLink } from "@/components/link";

export function SectionLink() {
  const pathname = usePathname();

  if (pathname.startsWith("/upload")) {
    return <NavLink href="/">catalog</NavLink>;
  }

  return <NavLink href="/upload">upload</NavLink>;
}
