"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useApiKeys } from "@/hooks/useApiKeys";
import Loading from "../loading";

const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const LoginForm = dynamic(
  () => import("@/components/LoginForm").then((mod) => mod.LoginForm),
  {
    ssr: false,
    loading: () => <LoadingIndicator loading="login form" />,
  },
);
const MainPanel = dynamic(
  () => import("@/components/MainPanel").then((mod) => mod.MainPanel),
  {
    ssr: false,
    loading: () => <LoadingIndicator loading="main panel" />,
  },
);
const Header = dynamic(() => import("./Header").then((mod) => mod.Header), {
  ssr: false,
  loading: () => <Loading isLoading={true} />,
});

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
    fetchApiKeys,
    generateNewKey,
    deleteKey,
  } = useApiKeys(adminApiKey, isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApiKeys();
    }
  }, [isAuthenticated, fetchApiKeys]);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Toaster position="top-right" />
          <LoginForm
            adminApiKey={adminApiKey}
            setAdminApiKey={setAdminApiKey}
            authenticate={authenticate}
            isAuthenticating={isAuthenticating}
            error={authError}
          />
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <Toaster position="top-right" />
      <main className="flex-grow p-4">
        <MainPanel
          newKeyDescription={newKeyDescription}
          setNewKeyDescription={setNewKeyDescription}
          generateNewKey={generateNewKey}
          isLoading={isLoading}
          error={apiKeysError}
          apiKeys={apiKeys.map((key) => ({
            ...key,
            key: key.key as string,
          }))}
          deletingKey={deletingKey}
          setDeletingKey={setDeletingKey}
          deleteKey={deleteKey}
        />
      </main>
    </div>
  );
};

export default PanelPage;
