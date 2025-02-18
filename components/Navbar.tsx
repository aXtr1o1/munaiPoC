"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-10 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
      <div className="px-8 py-4">
        <div className="flex items-center justify-center space-x-12">
          <Link
            href="/"
            className={cn(
              "relative text-lg font-medium transition-colors px-4 py-2 rounded-lg",
              pathname === "/" ? "text-white bg-white/10 backdrop-blur-md" : "text-white/70 hover:text-white/90"
            )}
          >
Reader's Report
</Link>
<Link
  href="/investors"
  className={cn(
    "relative text-lg transition-colors px-4 py-2 rounded-lg",
    pathname === "/investors" ? "text-white bg-white/10 backdrop-blur-md" : "text-white/70 hover:text-white/90"
  )}
>
  Reactor's Report
          </Link>
        </div>
      </div>
    </nav>
  );
}

