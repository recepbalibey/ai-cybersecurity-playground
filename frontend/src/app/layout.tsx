import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cybersecurity Playground | SOC Command Center",
  description: "Master's-level educational AI cybersecurity operations simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-base text-cyber-text antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
