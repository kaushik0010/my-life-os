import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthHandler } from "@/components/AuthHandler";
import { Toast } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life OS",
  description:
    "Turn your memories into folders and files inside nostalgic devices like Windows XP and Nokia.",

  openGraph: {
    title: "Life OS",
    description:
      "Store your memories as folders and files — inside Windows XP and Nokia.",
    url: "https://life-os-beta-ochre.vercel.app",
    siteName: "Life OS",
    images: [
      {
        url: "https://life-os-beta-ochre.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Your life... inside old devices",
    description:
      "Relive your memories as folders and files in a nostalgic OS experience.",
    images: ["https://life-os-beta-ochre.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <AuthHandler />
          <Toast />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
