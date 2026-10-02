import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cybersecurity Playground | Hands-on Security Labs",
  description: "Learn to investigate threats with AI and protect AI systems through 12 guided security labs. All scenarios are simulated.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-cyber-base text-cyber-text antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
