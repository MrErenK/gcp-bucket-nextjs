import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false },
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
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

interface DeleteConfirmationModalProps {
  deletingKey: { id: string; description: string } | null;
  confirmDescription: string;
  setConfirmDescription: (description: string) => void;
  showFinalConfirmation: boolean;
  handleDeleteConfirmation: () => void;
  handleFinalDeleteConfirmation: () => void;
  setDeletingKey: (key: { id: string; description: string } | null) => void;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  deletingKey,
  confirmDescription,
  setConfirmDescription,
  showFinalConfirmation,
  handleDeleteConfirmation,
  handleFinalDeleteConfirmation,
  setDeletingKey,
}) => (
  <div className="fixed inset-0 z-50 overflow-hidden">
    <div
      className="absolute inset-0 bg-black bg-opacity-50"
      onClick={() => setDeletingKey(null)}
    ></div>
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border border-primary/10 rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Confirm Deletion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-center">
            Are you sure you want to delete the API key for{" "}
            <strong className="text-primary">{deletingKey?.description}</strong>
            ? This action is{" "}
            <strong className="text-destructive">irreversible</strong>.
          </p>
          <Input
            type="text"
            placeholder="Type the description to confirm"
            value={confirmDescription}
            onChange={(e) => setConfirmDescription(e.target.value)}
            className="w-full py-2 px-3 rounded-lg border-2 border-primary/20 focus:border-primary focus:ring focus:ring-primary/30 transition-all duration-300"
          />
          {showFinalConfirmation ? (
            <Button
              variant="destructive"
              className="w-full py-3 transition duration-300 ease-in-out hover:bg-destructive/90 rounded-lg shadow-md hover:shadow-lg"
              onClick={handleFinalDeleteConfirmation}
            >
              Confirm Delete
            </Button>
          ) : (
            <Button
              disabled={confirmDescription !== deletingKey?.description}
              className="w-full py-3 transition duration-300 ease-in-out hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeleteConfirmation}
            >
              Delete Key
            </Button>
          )}
          <Button
            onClick={() => setDeletingKey(null)}
            variant="outline"
            className="w-full py-3 transition duration-300 ease-in-out hover:bg-primary/10 rounded-lg"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);
