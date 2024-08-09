import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud File Storage",
  description: "Google cloud storage bucket hosting for myself.",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="inter.className">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar
            closeOnClick
            pauseOnHover
            draggable
            newestOnTop={true}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
