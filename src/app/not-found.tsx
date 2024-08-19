import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@/components/Icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <main className="flex-grow container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-4xl flex items-center justify-center">
        <Card className="shadow-lg border border-primary/10 rounded-xl overflow-hidden w-full max-w-md">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-3xl font-bold text-center text-primary">
              404 - Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-6">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <Link href="/" passHref>
              <Button className="transition duration-300 ease-in-out transform hover:scale-105">
                <HomeIcon className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
