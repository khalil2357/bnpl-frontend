import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BNPL Prediction System",
  description: "AI-powered credit risk prediction and scoring for BNPL merchants. Real-time risk assessment and dynamic credit limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${space.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
