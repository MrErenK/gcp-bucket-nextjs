import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EreN's Bucket",
  description:
    "Google cloud storage bucket hosting for myself (and maybe fellow developers).",
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/icons/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/icons/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/icons/favicon-16x16.png",
    },
    { rel: "manifest", url: "/icons/site.webmanifest" },
    { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#5bbad5" },
    { rel: "shortcut icon", url: "/icons/favicon.ico" },
  ],
  other: {
    "msapplication-TileColor": "#da532c",
    "msapplication-config": "/icons/browserconfig.xml",
    "theme-color": "#ffffff",
    "msapplication-tap-highlight": "no",
    "X-UA-Compatible": "IE=edge",
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
