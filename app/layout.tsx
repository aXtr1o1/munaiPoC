import { DM_Sans, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar"; // Import Navbar
import Image from "next/image";

const dmSans = DM_Sans({ subsets: ["latin"] });
const bodoni = Bodoni_Moda({ subsets: ["latin"] });

export const metadata = {
  title: "StartUp Singam",
  description: "Filter startup ideas and investors based on specific requirements",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={cn(dmSans.className, "bg-[#2A2A2A]")}>
        <ErrorBoundary>
          <div className="absolute top-1 left-4">
            <Image src="/aXtrLabsicon.png" alt="Company Logo" width={240} height={80} />
          </div>
          <div className="absolute top-12 right-8">
            <Image src="/startupSingamicon.png" alt="Company Logo" width={120} height={40} />
          </div>
          <Navbar /> {/* Use Navbar component */}
          <main className="container mx-auto pt-24 px-4 min-h-screen">{children}</main>
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            an aXtr Prototype
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
