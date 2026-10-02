import React from "react";
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
}
export function Reveal({ children, className, as: Tag = "div" }: RevealProps) {
  return <Tag className={className}>{children}</Tag>;
}
