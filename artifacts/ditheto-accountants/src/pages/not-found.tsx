import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-heading font-extrabold text-secondary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
