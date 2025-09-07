import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FreelanceDAO - Decentralized Freelance Platform",
  description: "The First Fully Decentralized Freelance Platform on BlockDAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Microsoft Sans Serif, Arial, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}