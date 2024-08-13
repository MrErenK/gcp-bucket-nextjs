"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HomeIcon, PlusIcon, LockIcon } from "@/components/Icons";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Toaster, toast } from "react-hot-toast";
import APIKeyCard from "@/components/APIKeyCard";

const PanelPage = () => {
  const [apiKeys, setApiKeys] = useState<
    {
      key: ReactNode;
      id: string;
      description: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deletingKey, setDeletingKey] = useState<{
    id: string;
    description: string;
  } | null>(null);
  const [confirmDescription, setConfirmDescription] = useState("");
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/keys", {
          headers: {
            Authorization: `Bearer ${adminApiKey}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch API keys");
        const data = await response.json();
        setApiKeys(data.keys);
      } catch (err) {
        console.error("Error fetching API keys:", err);
        setError("Failed to load API keys");
        toast.error("Failed to load API keys");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchApiKeys();
    }
  }, [adminApiKey, isAuthenticated]);

  useEffect(() => {
    if (deletingKey) {
      document.body.classList.add("overlay-active");
    } else {
      document.body.classList.remove("overlay-active");
    }

    return () => {
      document.body.classList.remove("overlay-active");
    };
  }, [deletingKey]);

  useEffect(() => {
    if (deletingKey) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deletingKey]);

  const authenticate = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: adminApiKey }),
      });
      if (!response.ok) throw new Error("Authentication failed");
      setIsAuthenticated(true);
      toast.success("Authentication successful");
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Authentication failed. Please check your API key.");
      toast.error("Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/keys", {
        headers: {
          Authorization: `Bearer ${adminApiKey}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const data = await response.json();
      setApiKeys(data.keys);
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError("Failed to load API keys");
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewKey = async () => {
    if (!newKeyDescription.trim()) {
      toast.error("Please enter a description for the new key");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApiKey}`,
        },
        body: JSON.stringify({ description: newKeyDescription }),
      });
      if (!response.ok) throw new Error("Failed to generate new key");
      await fetchApiKeys();
      setNewKeyDescription("");
      toast.success("New key generated successfully");
    } catch (err) {
      console.error("Error generating new key:", err);
      toast.error("Failed to generate new key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmation = () => {
    if (deletingKey && confirmDescription === deletingKey.description) {
      setShowFinalConfirmation(true);
    }
  };

  const handleFinalDeleteConfirmation = async () => {
    if (deletingKey) {
      await deleteKey(deletingKey.id);
      setShowFinalConfirmation(false);
      setDeletingKey(null);
      setConfirmDescription("");
    }
  };

  const deleteKey = async (keyId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminApiKey}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete key");
      await fetchApiKeys();
      toast.success("API key deleted successfully");
    } catch (err) {
      console.error("Error deleting key:", err);
      toast.error("Failed to delete key");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
        <Toaster position="top-right" />
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className="absolute top-4 left-4 transition duration-300 ease-in-out hover:bg-primary/10 rounded-full"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <Card className="w-full max-w-md shadow-xl border border-primary/10 rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 bg-primary/5 border-b border-primary/10 p-6">
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground text-sm text-center">
              Enter your admin API key to access the panel
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter admin API key"
                value={adminApiKey}
                onChange={(e) => setAdminApiKey(e.target.value)}
                className="pr-10 py-3 rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
              />
              <LockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>
            <Button
              onClick={authenticate}
              disabled={isAuthenticating}
              className="w-full py-3 transition duration-300 ease-in-out bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? (
                <LoadingIndicator loading="login" />
              ) : (
                <span className="flex items-center justify-center">
                  <LockIcon className="w-5 h-5 mr-2" />
                  Authenticate
                </span>
              )}
            </Button>
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleDelete(id: string): void {
    setDeletingKey(apiKeys.find((key) => key.id === id) || null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Toaster position="top-right" />
      <header className="flex justify-between items-center p-6 bg-card shadow-md">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10 rounded-full"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <ThemeSwitch />
      </header>
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
        <Card className="mb-8 border border-primary/10 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-3xl font-bold text-center sm:text-left text-primary">
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Enter new key description"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  className="pr-10 w-full rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
                />
              </div>
              <Button
                onClick={generateNewKey}
                disabled={isLoading}
                className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/90 rounded-lg px-6 py-3 bg-primary shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isLoading ? (
                  <LoadingIndicator loading="create" />
                ) : (
                  <span className="flex items-center justify-center text-primary-foreground">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Generate New Key
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingIndicator loading="keys" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {apiKeys.length === 0 ? (
              <p className="text-center text-muted-foreground text-lg">
                No API keys found.
              </p>
            ) : (
              apiKeys.map((key) => (
                <div className="max-w-2xl mx-auto" key={key.id}>
                  <APIKeyCard
                    apiKey={key}
                    onDelete={handleDelete}
                    toast={toast}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </main>
      {deletingKey && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setDeletingKey(null)}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border border-primary/10 rounded-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-2xl font-bold text-center text-primary">
                  Confirm Deletion
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-center">
                  Are you sure you want to delete the API key for{" "}
                  <strong className="text-primary">
                    {deletingKey.description}
                  </strong>
                  ? This action is{" "}
                  <strong className="text-destructive">irreversible</strong>.
                </p>
                <Input
                  type="text"
                  placeholder="Type the description to confirm"
                  value={confirmDescription}
                  onChange={(e) => setConfirmDescription(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
                />
                {showFinalConfirmation ? (
                  <Button
                    variant="destructive"
                    className="w-full py-3 transition duration-300 ease-in-out hover:bg-destructive/90 rounded-lg shadow-md hover:shadow-lg"
                    onClick={handleFinalDeleteConfirmation}
                  >
                    Confirm Delete
                  </Button>
                ) : (
                  <Button
                    disabled={confirmDescription !== deletingKey.description}
                    className="w-full py-3 transition duration-300 ease-in-out hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteConfirmation}
                  >
                    Delete Key
                  </Button>
                )}
                <Button
                  onClick={() => setDeletingKey(null)}
                  variant="outline"
                  className="w-full py-3 transition duration-300 ease-in-out hover:bg-primary/10 rounded-lg"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelPage;
