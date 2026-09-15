import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { MessageCircle } from "lucide-react";
import { PageEnter } from "@/components/motion/reveal";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Navbar />
        <main className="flex-1 w-full bg-background">
         <PageEnter>{children}</PageEnter>
      </main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/27677657387?text=Hi%20Ditheto%20Accountants,%20I%20need%20assistance%20with..."
        target="_blank"
        rel="noopener noreferrer"
         className="group fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full bg-primary p-4 text-white shadow-[0_14px_30px_-10px_hsl(var(--primary)/.65)] ring-4 ring-background/80 transition-transform duration-300 hover:-translate-y-1 hover:bg-secondary"
        aria-label="Chat on WhatsApp"
        data-testid="link-floating-whatsapp"
      >
        <MessageCircle className="h-7 w-7" />
         <span className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded-sm bg-secondary px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Chat with us
        </span>
      </a>
    </div>
  );
}
