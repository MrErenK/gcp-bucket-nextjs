"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const EyeIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeIcon),
  {
    ssr: false,
  },
);
const EyeOffIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.EyeOffIcon),
  {
    ssr: false,
  },
);

const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  { ssr: false, loading: () => <Loading isLoading={true} /> },
);

export default function SignIn() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/files/manage");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      apiKey,
      redirect: false,
    });
    if (result?.error) {
      toast.error("Invalid API key. Please try again.");
    } else {
      toast.success(
        "Successfully signed in, redirecting to the file manager...",
      );
      setTimeout(() => {
        router.push("/files/manage");
      }, 2000);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return null;
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center sm:text-left text-primary">
          Sign In
        </h1>
        <div className="bg-card shadow-lg rounded-xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showApiKey ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
