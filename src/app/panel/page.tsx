"use client";
import React from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/panel/LoginForm";
import { MainPanel } from "@/components/panel/MainPanel";
import { Header } from "@/components/layout/Header";
import { AdminIcon } from "@/components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";

const PanelPage = () => {
  const {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error: authError,
    authenticate,
  } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card border border-border",
          duration: 3000,
        }}
      />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Header showNav={false} />
            <main className="container mx-auto px-4 sm:px-6 min-h-[calc(100vh-4rem)] flex items-center justify-center">
              <LoginForm
                adminApiKey={adminApiKey}
                setAdminApiKey={setAdminApiKey}
                authenticate={authenticate}
                isAuthenticating={isAuthenticating}
                error={authError}
              />
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col"
          >
            <Header title="Admin Panel" titleIcon={AdminIcon} />
            <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <MainPanel />
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PanelPage;
