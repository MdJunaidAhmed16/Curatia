import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Trends — Daily AI Tools & Repos",
  description:
    "Latest AI tools, GitHub repos, HN discussions, and Product Hunt launches updated every night. No sign-up required.",
  openGraph: {
    title: "AI Trends — Daily AI Tools & Repos",
    description: "Latest AI tools and repos updated nightly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
