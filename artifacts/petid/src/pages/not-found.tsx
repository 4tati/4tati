import { Link } from "wouter";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-6 bg-background">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
         <Search className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-serif font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">We couldn't find what you were looking for.</p>
      </div>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
