import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
