import type { Metadata } from "next";
import { inter, spaceGrotesk } from "../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommunityPulse | AI-Powered Crisis Response & Intelligence",
  description: "CommunityPulse is a mission-control platform that transforms community survey data into actionable intelligence and matches volunteers to urgent needs in real-time.",
  keywords: ["NGO", "Crisis Response", "AI", "Volunteer Matching", "Community Intelligence", "Humanitarian Aid"],
  authors: [{ name: "CommunityPulse Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f131f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
