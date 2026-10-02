import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: "/logo.png", apple: "/logo.png" },
  title: "AI Security",
  description: "Learn to investigate threats with AI and protect AI systems through 12 guided security labs. All scenarios are simulated.",
};

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "400 800",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-jb-mono",
  display: "swap",
  weight: "400 700",
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
