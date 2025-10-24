import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactReduxProvider from "./providers";

export const metadata: Metadata = {
  title: "SPD Global",
  description: "Your one-stop solution for lifestyle, fashion, and home products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReactReduxProvider>
          {/* Global gradient background to match About page */}
          <div className="min-h-screen bg-gradient-to-b from-[#FFECE0] via-[#EAB4B4] to-[#FFECE0]">
            <div className="page-container">
              <Navbar />
              <main className="main-content">{children}</main>
              <Footer />
            </div>
          </div>
        </ReactReduxProvider>
      </body>
    </html>
  );
}
