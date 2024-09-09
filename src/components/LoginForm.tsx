import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false },
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false },
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false },
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false },
);
const LockIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.LockIcon),
  { ssr: false },
);
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);

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
    <Card className="w-full max-w-md mx-auto shadow-2xl border border-primary/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
      <CardHeader className="space-y-2 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6 sm:p-8">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-primary">
          Admin Login
        </CardTitle>
        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Enter your admin API key to access the panel
        </p>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="relative">
          <Input
            type="password"
            placeholder="Enter admin API key"
            value={adminApiKey}
            onChange={(e) => setAdminApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10 py-3 rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300 text-base"
          />
          <LockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        </div>
        <Button
          onClick={authenticate}
          disabled={isAuthenticating}
          className="w-full py-3 transition duration-300 ease-in-out bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm sm:text-base"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
