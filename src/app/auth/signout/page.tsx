"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";

const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  { ssr: false, loading: () => <Loading isLoading={true} /> },
);

export default function SignOut() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    try {
      const result = await signOut({ redirect: false });
      toast.success("Successfully signed out, redirecting to main page...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center sm:text-left text-primary">
          Sign Out
        </h1>
        <div className="bg-card shadow-lg rounded-xl p-8 border border-border">
          <p className="mb-4">Are you sure you want to sign out?</p>
          <Button onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
