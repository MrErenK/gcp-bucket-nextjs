"use client";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useUserFileManagement } from "@/hooks/useUserFileManagement";
import { formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false },
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false },
);
const Dialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.Dialog),
  { ssr: false },
);
const DialogContent = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogContent),
  { ssr: false },
);
const DialogHeader = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogHeader),
  { ssr: false },
);
const DialogTitle = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogTitle),
  { ssr: false },
);
const DialogFooter = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogFooter),
  { ssr: false },
);
const RefreshIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.RefreshIcon),
  { ssr: false },
);
const FileIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileIcon),
  { ssr: false },
);
const DownloadCountIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.DownloadCountIcon),
  { ssr: false },
);
const FileStatsIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.FileStatsIcon),
  { ssr: false },
);
const RenameIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.RenameIcon),
  { ssr: false },
);
const TrashIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.TrashIcon),
  { ssr: false },
);
const EyeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeOffIcon),
  { ssr: false },
);
const UserIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.UserIcon),
  { ssr: false },
);
const CopyIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.CopyIcon),
  { ssr: false },
);
const DownloadIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.DownloadIcon),
  { ssr: false },
);
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);

export function UserFileManager() {
  const { data: session, status } = useSession();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const {
    files,
    totalFiles,
    totalSize,
    error,
    fetchFiles,
    handleDelete,
    handleRename,
    isLoggedIn,
    setIsLoggedIn,
  } = useUserFileManagement();

  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [fileToRename, setFileToRename] = useState("");
  const [newFileName, setNewFileName] = useState("");

  const handleLogout = useCallback(() => {
    signOut();
    toast.success(
      "Logged out successfully, redirecting to the sign in page...",
    );
    setTimeout(() => {
      router.push("/auth/signin");
    }, 1000);
  }, [router]);

  useEffect(() => {
    const updateSessionState = async () => {
      if (session) {
        setIsLoggedIn(true);
        fetchFiles();
      } else {
        setIsLoggedIn(false);
      }
    };

    updateSessionState();
  }, [session, fetchFiles, setIsLoggedIn]);

  const handleRenameClick = (filename: string) => {
    setFileToRename(filename);
    setNewFileName(filename);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async () => {
    try {
      await handleRename(fileToRename, newFileName);
      toast.success("File renamed successfully");
    } catch (error) {
      toast.error("Failed to rename file");
    } finally {
      setShowRenameDialog(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  const handleLogin = async () => {
    const result = await signIn("credentials", {
      apiKey: apiKeyInput,
      redirect: false,
    });
    if (result?.error) {
      setLoginError("Invalid API key, please check your key and try again.");
      toast.error("Invalid API key, please check your key and try again.");
    } else {
      setLoginError(null);
      toast.success("Successfully logged in as " + session?.user.name);
      router.refresh();
    }
  };

  const handleCopyLink = (fileName: string) => {
    const fileLink = `${window.location.origin}/api/download?filename=${encodeURIComponent(fileName)}`;
    navigator.clipboard.writeText(fileLink);
    toast.success("File link copied to clipboard");
  };

  const handleDownload = (fileName: string) => {
    window.location.href = `/api/download?filename=${fileName}`;
  };

  if (status === "loading") {
    return <LoadingIndicator loading="components" />;
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Toaster position="top-right" />
        <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-primary">
              User File Management
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter your API key"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              {loginError && (
                <p className="text-red-500 text-sm">{loginError}</p>
              )}
              <Button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-secondary font-semibold py-2 px-4 rounded-md transition-colors duration-300"
              >
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6">
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster position="top-right" />
      <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            {isLoggedIn && session?.user.name && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-primary text-lg font-semibold">
                  Welcome back, {session?.user.name}!
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="text-sm md:text-base px-4 py-2 md:px-6 md:py-3 transition-all duration-300"
                  >
                    Logout
                  </Button>
                  <Button
                    onClick={() => router.push("/profile")}
                    variant="outline"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Files</h2>
              <Button onClick={handleRefresh} className="flex items-center">
                <RefreshIcon className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.name}
                  className="bg-card rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-start gap-4">
                      <FileIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary flex-shrink-0" />
                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/files/${encodeURIComponent(file.name)}`}
                          passHref
                        >
                          <h3 className="font-semibold text-primary hover:text-primary/80 cursor-pointer text-lg sm:text-xl break-words">
                            {file.name}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center mt-1 text-sm text-muted-foreground gap-2">
                          <span className="flex items-center">
                            <DownloadCountIcon className="w-4 h-4 mr-1" />
                            <strong>{file.downloads}</strong>
                          </span>
                          <span className="flex items-center">
                            <FileStatsIcon className="w-4 h-4 mr-1" />
                            <span>{formatFileSize(file.size)}</span>
                          </span>
                          <span>
                            {new Date(file.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full justify-start mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleRenameClick(file.name)}
                      >
                        <RenameIcon className="w-4 h-4 mr-2" />
                        Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleDelete(file.name);
                          toast.success("File deleted successfully");
                        }}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(file.name)}
                      >
                        <CopyIcon className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file.name)}
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
        <div className="bg-primary/5 px-6 py-4 border-t border-primary/10">
          <div className="flex justify-between items-center text-sm text-primary">
            <span>Total Files: {totalFiles}</span>
            <span>Total Size: {formatFileSize(totalSize)}</span>
          </div>
        </div>
      </Card>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter new file name"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
