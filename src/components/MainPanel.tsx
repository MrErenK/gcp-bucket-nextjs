"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import Loading from "@/app/loading";

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
const PlusIcon = dynamic(
  () => import("@/components/Icons").then((mod) => mod.PlusIcon),
  { ssr: false },
);
const LoadingIndicator = dynamic(
  () =>
    import("@/components/LoadingIndicator").then((mod) => mod.LoadingIndicator),
  { ssr: false },
);
const AdminFileManager = dynamic(
  () => import("@/components/AdminFileManager").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <LoadingIndicator loading="file manager" />,
  },
);
const APIKeyCard = dynamic(
  () => import("@/components/APIKeyCard").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <LoadingIndicator loading="keys" />,
  },
);
const Header = dynamic(
  () => import("@/app/panel/Header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => <Loading isLoading={true} />,
  },
);

interface MainPanelProps {
  newKeyDescription: string;
  setNewKeyDescription: (description: string) => void;
  generateNewKey: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  apiKeys: Array<{ key: string; id: string; description: string }> | null;
  deletingKey: { id: string; description: string } | null;
  setDeletingKey: (key: { id: string; description: string } | null) => void;
  deleteKey: (id: string) => Promise<void>;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  newKeyDescription,
  setNewKeyDescription,
  generateNewKey,
  isLoading,
  error,
  apiKeys,
  deletingKey,
  setDeletingKey,
  deleteKey,
}) => {
  const handleGenerateNewKey = async () => {
    try {
      await generateNewKey();
      toast.success("New API key generated successfully");
    } catch (error) {
      toast.error("Failed to generate new API key");
    }
  };

  const handleDeleteKey = async () => {
    if (deletingKey) {
      try {
        await deleteKey(deletingKey.id);
        toast.success("API key deleted successfully");
        setDeletingKey(null);
      } catch (error) {
        toast.error("Failed to delete API key");
      }
    }
  };

  const buttonClasses =
    "transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground";

  return (
    <>
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 lg:py-16 max-w-7xl">
        <div className="space-y-8 sm:space-y-12">
          <div className="flex flex-col gap-4">
            <Header />
          </div>
          <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-primary">
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Enter new key description"
                    value={newKeyDescription}
                    onChange={(e) => setNewKeyDescription(e.target.value)}
                    className="pr-10 w-full rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
                  />
                </div>
                <Button
                  onClick={handleGenerateNewKey}
                  disabled={isLoading}
                  className={buttonClasses}
                >
                  {isLoading ? (
                    <LoadingIndicator loading="create" />
                  ) : (
                    <span className="flex items-center justify-center text-primary-foreground">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Generate New Key
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6">
              <CardTitle className="text-2xl font-semibold text-primary">
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingIndicator loading="keys" />
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.isArray(apiKeys) && apiKeys.length === 0 ? (
                    <p className="text-center text-muted-foreground text-lg">
                      No API keys found.
                    </p>
                  ) : Array.isArray(apiKeys) ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {apiKeys.map((key) => (
                        <APIKeyCard
                          key={key.id}
                          apiKey={key}
                          onDelete={() => setDeletingKey(key)}
                          toast={toast}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground text-lg">
                      Error: Unable to display API keys.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog
          open={!!deletingKey}
          onOpenChange={(open) => !open && setDeletingKey(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p className="text-center py-4">
              Are you sure you want to delete the API key for{" "}
              <strong className="text-primary">
                {deletingKey?.description}
              </strong>
              ? This action is{" "}
              <strong className="text-destructive">irreversible</strong>.
            </p>
            <DialogFooter className="sm:justify-center sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => setDeletingKey(null)}
                className={buttonClasses}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteKey}
                className={buttonClasses}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-8 sm:mt-12">
          <Card className="border border-primary/10 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-6">
              <CardTitle className="text-2xl font-semibold text-primary">
                File Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AdminFileManager />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};
