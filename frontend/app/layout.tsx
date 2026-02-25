import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CurateAI — Daily AI Tools & Repos",
  description:
    "Latest AI tools, GitHub repos, HN discussions, and Product Hunt launches — curated every night. No sign-up required.",
  openGraph: {
    title: "CurateAI — Daily AI Tools & Repos",
    description: "The best new AI tools and repos, updated every night.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
