"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

const HomeIcon = dynamic(() => import('@/components/Icons').then(mod => mod.HomeIcon), { ssr: false });
const RefreshIcon = dynamic(() => import('@/components/Icons').then(mod => mod.RefreshIcon), { ssr: false });
const Card = dynamic(() => import('@/components/ui/card').then(mod => mod.Card), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => mod.CardContent), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => mod.CardTitle), { ssr: false });

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <header className="flex justify-between items-center p-6 bg-card shadow-md"></header>
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl flex items-center justify-center">
        <Card className="shadow-lg border border-primary/10 rounded-xl overflow-hidden w-full max-w-md">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Oops! Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-6">
              We&apos;re sorry, but we encountered an unexpected error.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => reset()}
                className="transition duration-300 ease-in-out transform hover:scale-105"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Try again
              </Button>
              <Link href="/" passHref>
                <Button
                  variant="outline"
                  className="transition duration-300 ease-in-out transform hover:scale-105"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
