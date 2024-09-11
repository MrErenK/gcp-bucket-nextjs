"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  { ssr: false, loading: () => <Loading isLoading={true} /> },
);

export default function AuthError() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/files/manage");
    }
  }, [status, router]);

  const handleRetry = () => {
    router.push("/auth/signin");
  };

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center sm:text-left text-primary">
          Authentication Error
        </h1>
        <div className="bg-card shadow-lg rounded-xl p-8 border border-border">
          <p className="mb-4">
            There was an error during authentication. Please try again.
          </p>
          <Button onClick={handleRetry} className="w-full">
            Retry Authentication
          </Button>
        </div>
      </div>
    </>
  );
}
