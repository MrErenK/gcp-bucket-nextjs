import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockIcon, ApiKeyIcon, LoadingIcon } from "@/components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  adminApiKey: string;
  setAdminApiKey: (key: string) => void;
  authenticate: () => void;
  isAuthenticating: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  adminApiKey,
  setAdminApiKey,
  authenticate,
  isAuthenticating,
  error,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      authenticate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div className="relative">
        <Card className="rounded-2xl overflow-hidden">
          <CardHeader className="space-y-6 pb-8 pt-8">
            {/* Icon Container */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mx-auto p-3 bg-accent border rounded-xl w-fit"
            >
              <LockIcon className="w-8 h-8" />
            </motion.div>

            {/* Title and Description */}
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Admin Login
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your admin API key to access the panel
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
                <ApiKeyIcon className="w-5 h-5" />
              </div>
              <Input
                type="password"
                placeholder="Enter admin API key"
                value={adminApiKey}
                onChange={(e) => setAdminApiKey(e.target.value)}
                onKeyDown={handleKeyPress}
                className={cn(
                  "h-12 pl-10 pr-4",
                  "rounded-xl transition-colors duration-200",
                  "placeholder:text-muted-foreground/50",
                  "mt-3",
                )}
              />
            </div>

            <Button
              onClick={authenticate}
              disabled={isAuthenticating}
              className={cn(
                "w-full h-12 rounded-xl font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "shadow-sm hover:shadow disabled:shadow-none",
                "transition-all duration-300",
                "disabled:opacity-50",
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isAuthenticating ? "loading" : "static"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-center"
                >
                  {isAuthenticating ? (
                    <>
                      <LoadingIcon className="w-5 h-5 mr-2 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LockIcon className="w-5 h-5 mr-2" />
                      <span>Authenticate</span>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive text-center">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
