"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon, RefreshIcon, AlertCircleIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <Card className="relative bg-card border-border rounded-2xl overflow-hidden">
            <CardHeader className="space-y-4 border-b p-6">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{
                  scale: [0.5, 1.2, 1],
                  rotate: [0, -10, 0],
                }}
                transition={{ duration: 0.5 }}
                className="mx-auto p-4 bg-destructive/10 rounded-xl w-fit"
              >
                <AlertCircleIcon className="w-10 h-10 text-destructive" />
              </motion.div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-destructive">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 text-center"
              >
                <p className="text-muted-foreground">
                  We&apos;re sorry, but we encountered an unexpected error. Our
                  team has been notified and is working on a fix.
                </p>
                <p className="text-xs text-destructive/80">
                  Error: {error.message || "Unknown error"}
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={reset}
                  className={cn(
                    "group transition-all duration-300",
                    "bg-destructive hover:bg-destructive/90",
                  )}
                >
                  <RefreshIcon className="w-5 h-5 mr-2 transition-transform duration-500 group-hover:rotate-180" />
                  Try again
                </Button>
                <Button className="group transition-all duration-300 bg-foreground hover:bg-foreground/90">
                  <HomeIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
