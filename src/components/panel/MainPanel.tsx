import React from "react";
import AdminFileManager from "@/components/panel/AdminFileManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileManagerIcon } from "@/components/ui/Icons";
import { motion } from "framer-motion";

interface MainPanelProps {}

export const MainPanel: React.FC<MainPanelProps> = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader className="space-y-2 sm:space-y-3 border-b p-4 sm:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-accent rounded-lg sm:rounded-xl">
              <FileManagerIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold pt-2 sm:pt-4">
              File Management
            </CardTitle>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your uploaded files
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <AdminFileManager />
        </CardContent>
      </Card>
    </motion.div>
  );
};
