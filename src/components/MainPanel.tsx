import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import APIKeyCard from "@/components/APIKeyCard";
import dynamic from 'next/dynamic';

const toast = dynamic(() => import('react-hot-toast').then(mod => mod.toast), { ssr: false });
const Card = dynamic(() => import('@/components/ui/card').then(mod => mod.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => mod.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => mod.CardContent), { ssr: false });
const PlusIcon = dynamic(() => import('@/components/Icons').then(mod => mod.PlusIcon), { ssr: false });
const LoadingIndicator = dynamic(() => import('@/components/LoadingIndicator').then(mod => mod.LoadingIndicator), { ssr: false });

interface MainPanelProps {
  newKeyDescription: string;
  setNewKeyDescription: (description: string) => void;
  generateNewKey: () => void;
  isLoading: boolean;
  error: string | null;
  apiKeys: Array<{ key: React.ReactNode; id: string; description: string }>;
  handleDelete: (id: string) => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  newKeyDescription,
  setNewKeyDescription,
  generateNewKey,
  isLoading,
  error,
  apiKeys,
  handleDelete,
}) => (
  <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl">
    <Card className="mb-8 border border-primary/10 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-3xl font-bold text-center sm:text-left text-primary">
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
            onClick={generateNewKey}
            disabled={isLoading}
            className="transition duration-300 ease-in-out transform hover:scale-105 hover:bg-primary/90 rounded-lg px-6 py-3 bg-primary shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
        {apiKeys.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            No API keys found.
          </p>
        ) : (
          apiKeys.map((key) => (
            <div className="max-w-2xl mx-auto" key={key.id}>
              <APIKeyCard
                apiKey={key}
                onDelete={() => handleDelete(key.id)}
                toast={toast}
              />
            </div>
          ))
        )}
      </div>
    )}
  </main>
);
