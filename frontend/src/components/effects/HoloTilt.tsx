import React from "react";
interface HoloTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glow?: boolean;
  spotlight?: boolean;
}
export function HoloTilt({ children, className }: HoloTiltProps) {
  return <div className={className}>{children}</div>;
}
