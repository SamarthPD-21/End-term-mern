import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactReduxProvider from "./providers";

export const metadata: Metadata = {
  title: "VeBlyss Global",
  description: "Your one-stop solution for lifestyle, fashion, and home products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fcede1]">
        <ReactReduxProvider>
          <div className="page-container">
          <Navbar />
            <main className="main-content">{children}</main>
          <Footer />
          </div>
        </ReactReduxProvider>
      </body>
    </html>
  );
}
