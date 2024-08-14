import { useState } from "react";
import { toast } from "react-hot-toast";

export const useAuth = () => {
  const [adminApiKey, setAdminApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    adminApiKey,
    setAdminApiKey,
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
  };
};
