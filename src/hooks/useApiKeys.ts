import { useState, useEffect, ReactNode, useCallback } from "react";

export const useApiKeys = (adminApiKey: string, isAuthenticated: boolean) => {
  const [apiKeys, setApiKeys] = useState<
    { key: ReactNode; id: string; description: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [deletingKey, setDeletingKey] = useState<{
    id: string;
    description: string;
  } | null>(null);
  const [confirmDescription, setConfirmDescription] = useState("");
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  const fetchApiKeys = useCallback(async () => {
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
    } finally {
      setIsLoading(false);
    }
  }, [adminApiKey]);

  const generateNewKey = async () => {
    if (!newKeyDescription.trim()) {
      setError("Please enter a description for the new key");
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
    } catch (err) {
      console.error("Error generating new key:", err);
      setError("Failed to generate new key");
    } finally {
      setIsLoading(false);
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
    } catch (err) {
      console.error("Error deleting key:", err);
      setError("Failed to delete key");
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

  useEffect(() => {
    if (adminApiKey) {
      fetchApiKeys();
    }
  }, [adminApiKey, fetchApiKeys]);

  useEffect(() => {
    if (deletingKey) {
      document.body.classList.add("overlay-active");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("overlay-active");
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.classList.remove("overlay-active");
      document.body.style.overflow = "unset";
    };
  }, [deletingKey]);

  return {
    apiKeys,
    isLoading,
    error,
    newKeyDescription,
    setNewKeyDescription,
    deletingKey,
    setDeletingKey,
    confirmDescription,
    setConfirmDescription,
    showFinalConfirmation,
    setShowFinalConfirmation,
    fetchApiKeys,
    generateNewKey,
    handleDeleteConfirmation,
    handleFinalDeleteConfirmation,
    deleteKey,
  };
};
