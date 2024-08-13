"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  LockIcon,
  CopyIcon,
} from "@/components/Icons";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Toaster, toast } from "react-hot-toast";

const PanelPage = () => {
  const [apiKeys, setApiKeys] = useState<{ id: string; description: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
          variant="outline"
          className="absolute top-4 left-4 transition duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <Card className="w-full max-w-md shadow-lg border border-primary/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground text-sm text-center">
              Enter your admin API key to access the panel
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter admin API key"
                  value={adminApiKey}
                  onChange={(e) => setAdminApiKey(e.target.value)}
                  className="pr-10"
                />
                <LockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
              <Button
                onClick={authenticate}
                disabled={isAuthenticating}
                className="w-full transition duration-300 ease-in-out hover:bg-primary/90"
              >
                {isAuthenticating ? (
                  <LoadingIndicator loading="login" />
                ) : (
                  <div className="flex items-center justify-center">
                    <LockIcon className="w-4 h-4 mr-2" />
                    Authenticate
                  </div>
                )}
              </Button>
              {error && (
                <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Toaster position="top-right" />
      <header className="flex justify-between items-center p-4 bg-card shadow-md">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <ThemeSwitch />
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="mb-8 border border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center sm:text-left">
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter new key description"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button
                onClick={generateNewKey}
                disabled={isLoading}
                className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/90"
              >
                {isLoading ? (
                  <LoadingIndicator loading="create" />
                ) : (
                  <div className="flex items-center justify-center">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Generate New Key
                  </div>
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
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <p className="text-center">No API keys found.</p>
            ) : (
              apiKeys.map((key) => (
                <Card
                  key={key.id}
                  className="flex items-center justify-between p-4 border border-primary/10 shadow-sm"
                >
                  <CardContent>
                    <p className="text-lg font-semibold">{key.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Key: {key.id}
                    </p>
                  </CardContent>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10"
                      onClick={() => {
                        navigator.clipboard.writeText(key.id);
                        setCopiedId(key.id);
                        toast.success("API key ID copied to clipboard");
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                    >
                      {copiedId === key.id ? (
                        <span className="text-green-500">Copied</span>
                      ) : (
                        <CopyIcon className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-destructive/90"
                      onClick={() => setDeletingKey(key)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
      {deletingKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">
                Confirm Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                Are you sure you want to delete the API key for{" "}
                <strong>{deletingKey.description}</strong>? This action is{" "}
                <strong>irreversible</strong>.
              </p>
              <Input
                type="text"
                placeholder="Type the description to confirm"
                value={confirmDescription}
                onChange={(e) => setConfirmDescription(e.target.value)}
                className="mb-4"
              />
              {showFinalConfirmation ? (
                <Button
                  variant="destructive"
                  className="w-full transition duration-300 ease-in-out transform hover:scale-105 hover:bg-destructive/90"
                  onClick={handleFinalDeleteConfirmation}
                >
                  Confirm Delete
                </Button>
              ) : (
                <Button
                  disabled={confirmDescription !== deletingKey.description}
                  className="w-full transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/90"
                  onClick={handleDeleteConfirmation}
                >
                  Delete Key
                </Button>
              )}
            </CardContent>
            <Button
              onClick={() => setDeletingKey(null)}
              variant="outline"
              className="w-full mt-4 transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/10"
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PanelPage;
