"use client";

import React from "react";
import dynamic from "next/dynamic";
import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  { ssr: false, loading: () => <Loading isLoading={true} /> },
);
const UserFileManager = dynamic(
  () =>
    import("@/components/UserFileManager").then((mod) => mod.UserFileManager),
  { ssr: false },
);

const ManageFilesPage = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin");
    },
  });

  if (status === "loading") {
    return <LoadingIndicator loading="file manager" />;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center sm:text-left text-primary">
          Manage Your Files
        </h1>
        <div className="bg-card shadow-lg rounded-xl p-8 border border-border">
          <UserFileManager />
        </div>
      </div>
    </>
  );
};

export default ManageFilesPage;
