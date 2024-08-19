"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

const MaintenancePage = () => {
  return (
    <>
      <Toaster position="top-right" />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="bg-card rounded-xl shadow-lg border border-primary/10 overflow-hidden w-full max-w-2xl">
          <div className="bg-primary/5 border-b border-primary/10 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">
              Maintenance in Progress
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <p className="text-lg mb-8">
                We&apos;re currently performing some maintenance on our site.
                Our team is working hard to improve our services. We&apos;ll be
                back online shortly.
              </p>
              <p className="text-md text-muted-foreground mb-8">
                Thank you for your patience and understanding.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MaintenancePage;
