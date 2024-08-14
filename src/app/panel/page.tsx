"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@/components/Icons";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useApiKeys } from "@/hooks/useApiKeys";
import { LoginForm } from "@/components/LoginForm";
import { MainPanel } from "@/components/MainPanel";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";

const PanelPage = () => {
  const router = useRouter();
  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error: authError,
    authenticate,
  } = useAuth();

  const {
    apiKeys,
    isLoading,
    error: apiKeysError,
    newKeyDescription,
    setNewKeyDescription,
    deletingKey,
    setDeletingKey,
    confirmDescription,
    setConfirmDescription,
    showFinalConfirmation,
    generateNewKey,
    handleDeleteConfirmation,
    handleFinalDeleteConfirmation,
  } = useApiKeys(adminApiKey, isAuthenticated);

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
        <LoginForm
          adminApiKey={adminApiKey}
          setAdminApiKey={setAdminApiKey}
          authenticate={authenticate}
          isAuthenticating={isAuthenticating}
          error={authError}
        />
      </div>
    );
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
      <MainPanel
        newKeyDescription={newKeyDescription}
        setNewKeyDescription={setNewKeyDescription}
        generateNewKey={generateNewKey}
        isLoading={isLoading}
        error={apiKeysError}
        apiKeys={apiKeys}
        handleDelete={(id) =>
          setDeletingKey(apiKeys.find((key) => key.id === id) || null)
        }
      />
      {deletingKey && (
        <DeleteConfirmationModal
          deletingKey={deletingKey}
          confirmDescription={confirmDescription}
          setConfirmDescription={setConfirmDescription}
          showFinalConfirmation={showFinalConfirmation}
          handleDeleteConfirmation={handleDeleteConfirmation}
          handleFinalDeleteConfirmation={handleFinalDeleteConfirmation}
          setDeletingKey={setDeletingKey}
        />
      )}
    </div>
  );
};

export default PanelPage;
