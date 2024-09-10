"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUserFileManagement } from "@/hooks/useUserFileManagement";
import { formatFileSize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "@/app/loading";
import { toast, Toaster } from "react-hot-toast";

const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => <Loading isLoading={true} />,
  },
);

const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);

const EyeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeIcon),
  { ssr: false },
);
const EyeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeOffIcon),
  { ssr: false },
);
const CopyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CopyIcon),
  { ssr: false },
);

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      toast.error(
        "You must be logged in to view this page, redirecting to sign in...",
      );
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);
    },
  });

  const {
    files,
    totalFiles,
    totalSize,
    mostDownloadedFile,
    leastDownloadedFile,
    mostViewedFile,
    leastViewedFile,
    loading,
    error,
  } = useUserFileManagement();
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (session?.user?.apiKey && !apiKey) {
      setApiKey(session.user.apiKey);
    }
  }, [session, apiKey]);

  const handleCopyApiKey = () => {
    if (showApiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success("API Key copied to clipboard");
    }
  };

  const handleLogout = () => {
    signOut();
    toast.success(
      "Logged out successfully, redirecting to the sign in page...",
    );
    setTimeout(() => {
      router.push("/auth/signin");
    }, 1000);
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <LoadingIndicator loading="profile" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="text-red-500 text-center p-4">{error}</div>
      </>
    );
  }

  const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0);
  const totalViews = files.reduce((sum, file) => sum + file.views, 0);

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary">
          Welcome back, {session?.user.name}!
        </h1>
        <h2 className="text-lg md:text-xl mb-4 text-center text-muted-foreground">
          Your Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                File Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm md:text-base">
                {[
                  { label: "Total Files", value: totalFiles },
                  { label: "Total Size", value: formatFileSize(totalSize) },
                  { label: "Total Downloads", value: totalDownloads },
                  { label: "Total Views", value: totalViews },
                ].map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </li>
                ))}
                {[
                  { label: "Most Downloaded", file: mostDownloadedFile },
                  { label: "Least Downloaded", file: leastDownloadedFile },
                  { label: "Most Viewed", file: mostViewedFile },
                  { label: "Least Viewed", file: leastViewedFile },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  >
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span
                      className="font-medium truncate max-w-[200px] sm:max-w-[150px] md:max-w-[200px]"
                      title={item.file?.name}
                    >
                      {item.file?.name || "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm md:text-base flex-grow truncate">
                    API Key:{" "}
                    <span className="font-mono">
                      {showApiKey ? apiKey : "•".repeat(24)}
                    </span>
                  </p>
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0"
                    aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                  >
                    {showApiKey ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </Button>
                  {showApiKey && (
                    <Button
                      onClick={handleCopyApiKey}
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                      aria-label="Copy API Key"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => router.push("/files/manage")}
            variant="outline"
            className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            Manage Your Files
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3 transition-all duration-300 hover:bg-red-600 hover:text-primary"
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
