import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumora.io"),
  title: {
    default: "Lumora — a cozy home for your files",
    template: "%s · Lumora",
  },
  description:
    "Free, fast & friendly hosting for your images, video, audio and files. Drop it, share it, done. ✨",
  applicationName: "Lumora",
  openGraph: {
    title: "Lumora — a cozy home for your files",
    description: "Drop it · share it · done. Free image, video, audio & file hosting.",
    type: "website",
    siteName: "Lumora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora — a cozy home for your files",
    description: "Drop it · share it · done. Free image, video, audio & file hosting.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <div className="aura-bg" />
        <div className="grid-overlay" />
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
