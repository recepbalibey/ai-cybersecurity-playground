"use client";

import React from "react";
import { Server, Database, Cloud, Wifi } from "lucide-react";
import { TelemetrySource } from "@/services/threatHunter";

interface TelemetryExplorerProps {
  sources: TelemetrySource[];
  isHunting: boolean;
}

export function TelemetryExplorer({
  sources,
  isHunting,
}: TelemetryExplorerProps) {
  const getIcon = (name: string) => {
    if (name.includes("Windows")) return Server;
    if (name.includes("Network")) return Wifi;
    if (name.includes("DNS")) return Database;
    return Cloud;
  };

  return (
    <div className="cyber-panel border border-cyber-border overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-surface/60 flex items-center justify-between holo-scan">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-cyber-heading">
            Telemetry Explorer
          </h2>
        </div>
        <span className="text-xs text-cyber-muted font-mono uppercase">
          Enterprise Data Sources
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="text-xs text-cyber-muted font-mono uppercase mb-1">
          Active Environment Data Channels
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sources.map((src, idx) => {
            const Icon = getIcon(src.name);
            return (
              <div
                key={idx}
                style={{ animationDelay: `${idx * 80}ms` }}
                className={`decode-enter holo-panel p-3.5 rounded-lg border transition-all ${
                  isHunting && src.active
                    ? "bg-accent/10 border-cyan-500/50 shadow-cyan-glow"
                    : src.active
                    ? "bg-cyber-base/80 border-cyber-border"
                    : "bg-cyber-base/30 border-cyber-border opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isHunting && src.active
                          ? "text-accent animate-pulse"
                          : src.active
                          ? "text-status-success"
                          : "text-cyber-muted"
                      }`}
                    />
                    <span className="text-xs font-semibold text-cyber-heading">
                      {src.name}
                    </span>
                  </div>
                  <span
                    className={`text-[0.625rem] font-mono px-2 py-0.5 rounded ${
                      src.active
                        ? "bg-status-success/10 text-status-success border border-emerald-500/30"
                        : "bg-cyber-base text-cyber-muted border border-cyber-border"
                    }`}
                  >
                    {src.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-cyber-muted">
                  <span>Rate: {src.count}</span>
                  {isHunting && src.active && (
                    <span className="text-accent animate-pulse font-semibold">
                      SCANNING...
                      <span className="sonar ml-1.5 inline-block h-2 w-2 rounded-full bg-cyan-400 align-middle" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
