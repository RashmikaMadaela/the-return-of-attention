import type { Metadata } from "next";
import { Inter, Lexend, Arimo } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { SessionMonitor } from "@/components/SessionMonitor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Return of Attention - Practices for the Happiness that Stays",
  description: "A simple, practical guide to happiness that actually stays",
  other: {
    // Prevent certain browser extensions from injecting code
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${lexend.variable} ${arimo.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionProvider>
          <SessionMonitor />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
