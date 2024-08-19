"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, RefreshIcon } from "@/components/Icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
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
    <html>
      <body className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl min-h-screen flex items-center justify-center">
          <Card className="shadow-lg border border-primary/10 rounded-xl overflow-hidden w-full max-w-md">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-3xl font-bold text-center text-primary">
                Critical Error
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-destructive font-semibold mb-2">
                Something went wrong!
              </p>
              <p className="text-muted-foreground mb-6">
                We apologize for the inconvenience. Our team has been notified
                and is working on a fix.
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
        </div>
      </body>
    </html>
  );
}
