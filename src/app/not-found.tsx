"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeIcon, FileSearchIcon, ArrowLeftIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="space-y-4 p-6">
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mx-auto p-4 bg-accent border rounded-xl w-fit"
              >
                <FileSearchIcon className="w-10 h-10" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-center">
                404 - Page Not Found
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <p className="text-center text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="group transition-all duration-300"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                  Go Back
                </Button>
                <Link href="/">
                  <Button className="group transition-all duration-300">
                    <HomeIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                    Return Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
