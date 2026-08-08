"use client";

import { useId, useMemo, useState } from "react";
import {
  type FlowNode,
  type FlowNodeKind,
  NODE_KIND_INFO,
} from "@/services/learningHub";
import { cn } from "@/lib/cn";

// Colors are inline SVG values driven by theme CSS variables so boxes stay
// visible in both modes. Nodes/edges are visible by default; animation only
// adds motion and can never hide them.
const KIND: Record<
  FlowNodeKind,
  { fill: string; stroke: string; label: string; halo: string }
> = {
  input: {
    fill: "rgb(var(--cb-surface-hover))",
    stroke: "rgb(var(--cb-border-light))",
    label: "rgb(var(--cb-text))",
    halo: "none",
  },
  data: {
    fill: "rgb(var(--cb-surface-hover))",
    stroke: "rgb(var(--cb-border-light))",
    label: "rgb(var(--cb-text))",
    halo: "none",
  },
  model: {
    fill: "rgb(var(--cb-accent) / 0.16)",
    stroke: "rgb(var(--cb-accent))",
    label: "rgb(var(--cb-heading))",
    halo: "rgb(var(--cb-accent) / 0.4)",
  },
  output: {
    fill: "rgb(var(--cb-accent) / 0.28)",
    stroke: "rgb(var(--cb-accent))",
    label: "rgb(var(--cb-accent))",
    halo: "rgb(var(--cb-accent) / 0.3)",
  },
  risk: {
    fill: "rgb(244 63 94 / 0.18)",
    stroke: "rgb(244 63 94)",
    label: "rgb(251 113 133)",
    halo: "rgb(244 63 94 / 0.4)",
  },
  gate: {
    fill: "rgb(245 158 11 / 0.18)",
    stroke: "rgb(245 158 11)",
    label: "rgb(251 191 36)",
    halo: "rgb(245 158 11 / 0.4)",
  },
};

const PAD = 40;
const COL_STEP = 296;
const BOX_W = 216;
const BOX_H = 60;
const ROW_GAP = 84;
const TOP_BAND = 48;
const BOTTOM_BAND = 48;

export function TheoryFlow({
  nodes,
  edges,
}: {
  nodes: FlowNode[];
  edges: [string, string][];
}) {
  const markerId = useId().replace(/:/g, "");
  // Start with the first model node selected so the live data flow is
  // visible immediately instead of only after a click.
  const initialSelected = useMemo(
    () => nodes.find((n) => n.kind === "model")?.id ?? null,
    [nodes]
  );
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);

  const layout = useMemo(() => {
    const byId = new Map<string, FlowNode>();
    const cols = new Map<number, FlowNode[]>();
    nodes.forEach((n) => {
      byId.set(n.id, n);
      const list = cols.get(n.x) ?? [];
      list.push(n);
      cols.set(n.x, list);
    });

    const colKeys = Array.from(cols.keys()).sort((a, b) => a - b);
    const maxCol = colKeys.length ? colKeys[colKeys.length - 1] : 0;
    const width = PAD + maxCol * COL_STEP + BOX_W + PAD;

    let maxRows = 1;
    cols.forEach((list) => (maxRows = Math.max(maxRows, list.length)));
    const gridH = TOP_BAND + (maxRows - 1) * ROW_GAP + BOX_H + BOTTOM_BAND;
    const height = Math.max(gridH, BOX_H + TOP_BAND + BOTTOM_BAND);

    const pos = new Map<string, { left: number; right: number; top: number; bottom: number; cx: number; cy: number }>();
    cols.forEach((list, c) => {
      const sorted = [...list].sort((a, b) => a.y - b.y);
      const left = PAD + c * COL_STEP;
      const midY = TOP_BAND + ((sorted.length - 1) * ROW_GAP) / 2;
      sorted.forEach((n, i) => {
        const cy = midY + i * ROW_GAP;
        pos.set(n.id, {
          left,
          right: left + BOX_W,
          top: cy - BOX_H / 2,
          bottom: cy + BOX_H / 2,
          cx: left + BOX_W / 2,
          cy,
        });
      });
    });

    return { byId, pos, width, height };
  }, [nodes, edges]);

  const { byId, pos, width, height } = layout;
  const fbY = TOP_BAND / 2;
  const selected = selectedId ? byId.get(selectedId) : undefined;

  // Neighbours + incident edges of the selection, for emphasis + dimming.
  const focus = useMemo(() => {
    const neighbors = new Set<string>();
    const incident = new Set<number>();
    if (selectedId) {
      edges.forEach(([f, t], i) => {
        if (f === selectedId || t === selectedId) {
          incident.add(i);
          neighbors.add(f);
          neighbors.add(t);
        }
      });
    }
    return { neighbors, incident };
  }, [edges, selectedId]);

  const isFeedback = (fromId: string, toId: string): boolean => {
    const a = byId.get(fromId);
    const b = byId.get(toId);
    if (!a || !b) return false;
    return b.x < a.x || (b.x === a.x && b.y < a.y);
  };

  const edgePath = (fromId: string, toId: string): string => {
    const a = byId.get(fromId)!;
    const b = byId.get(toId)!;
    const pa = pos.get(fromId)!;
    const pb = pos.get(toId)!;

    if (b.x < a.x || (b.x === a.x && b.y < a.y)) {
      return `M ${pa.cx} ${pa.top} L ${pa.cx} ${fbY} H ${pb.cx} L ${pb.cx} ${pb.top}`;
    }
    if (b.x === a.x) {
      const midX = pa.right + 34;
      return `M ${pa.cx} ${pa.bottom} C ${midX} ${pa.bottom} ${midX} ${pb.top} ${pb.cx} ${pb.top}`;
    }
    if (pa.cy === pb.cy) {
      return `M ${pa.right} ${pa.cy} L ${pb.left} ${pb.cy}`;
    }
    const g = Math.max((pb.left - pa.right) / 2, 26);
    return `M ${pa.right} ${pa.cy} C ${pa.right + g} ${pa.cy} ${pb.left - g} ${pb.cy} ${pb.left} ${pb.cy}`;
  };

  const select = (id: string | null) => setSelectedId(id);

  const selectedInfo = selected ? NODE_KIND_INFO[selected.kind] : null;
  const neighborLabels = selectedId
    ? Array.from(focus.neighbors)
        .filter((id) => id !== selectedId)
        .map((id) => byId.get(id)?.label)
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-3">
      <div className="theory-flow w-full overflow-x-auto">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-full"
          onClick={() => select(null)}
          role="img"
          aria-label="Interactive concept schematic"
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="9"
              markerHeight="9"
              refX="7.5"
              refY="4.5"
              orient="auto"
            >
              <path d="M0,0 L9,4.5 L0,9 z" fill="rgb(var(--cb-border-light))" />
            </marker>
          </defs>

          {/* Edges - visible immediately, drawn in on mount; connected edges
              turn into a moving data flow when a node is selected. */}
          {edges.map(([fromId, toId], i) => {
            const pb = pos.get(toId);
            if (!pb) return null;
            const dash = isFeedback(fromId, toId);
            const live = selectedId !== null && focus.incident.has(i);
            const dim = selectedId !== null && !focus.incident.has(i);
            return (
              <path
                key={i}
                d={edgePath(fromId, toId)}
                fill="none"
                stroke={
                  live ? "rgb(var(--cb-accent))" : "rgb(var(--cb-border-light))"
                }
                strokeWidth={live ? 2.25 : 1.75}
                strokeDasharray={live ? undefined : dash ? "6 5" : "none"}
                className={cn(
                  "theory-edge",
                  live && "theory-edge-live",
                  dim && "theory-edge-dim"
                )}
                style={{ animationDelay: `${0.06 * i}s` }}
                markerEnd={`url(#${markerId})`}
                onClick={(e) => {
                  e.stopPropagation();
                  select(fromId);
                }}
              />
            );
          })}

          {/* Nodes - filled, labelled boxes with a soft halo on key roles.
              Click a node to inspect it; connected nodes stay bright. */}
          {nodes.map((n, i) => {
            const k = KIND[n.kind];
            const p = pos.get(n.id);
            if (!p) return null;
            const isSel = n.id === selectedId;
            const isNeighbor = focus.neighbors.has(n.id);
            const dim = selectedId !== null && !isSel && !isNeighbor;
            return (
              <g
                key={n.id}
                className={cn(
                  "theory-node",
                  isSel && "theory-selected",
                  dim && "theory-node-dim"
                )}
                style={{ animationDelay: `${0.05 * i}s` }}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}, ${selectedInfo ? selectedInfo.title : NODE_KIND_INFO[n.kind].title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  select(n.id === selectedId ? null : n.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(n.id === selectedId ? null : n.id);
                  }
                }}
              >
                {k.halo !== "none" && (
                  <rect
                    x={p.left - 4}
                    y={p.top - 4}
                    width={BOX_W + 8}
                    height={BOX_H + 8}
                    rx={11}
                    fill="none"
                    stroke={k.halo}
                    strokeWidth={7}
                    className="theory-halo"
                  />
                )}
                <rect
                  x={p.left - 2}
                  y={p.top - 2}
                  width={BOX_W + 4}
                  height={BOX_H + 4}
                  rx={11}
                  fill="none"
                  stroke="rgb(var(--cb-accent))"
                  strokeWidth={2}
                  className="theory-hoverring"
                />
                {isSel && (
                  <rect
                    x={p.left + 5}
                    y={p.top + 5}
                    width={BOX_W - 10}
                    height={BOX_H - 10}
                    rx={17}
                    fill="none"
                    stroke="rgb(var(--cb-accent))"
                    strokeWidth={2.5}
                    className="theory-selring"
                  />
                )}
                <rect
                  x={p.left}
                  y={p.top}
                  width={BOX_W}
                  height={BOX_H}
                  rx={9}
                  fill={k.fill}
                  stroke={k.stroke}
                  strokeWidth={1.5}
                />
                <text
                  x={p.cx}
                  y={p.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill={k.label}
                  className="font-sans"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive inspector panel */}
      <div className="rounded-lg border border-cyber-border bg-cyber-surface/50 p-4">
        {selected && selectedId && selectedInfo && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-accent/40" />
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-cyber-muted">
                {selectedInfo.title}
              </p>
              <p className="mt-0.5 text-sm text-cyber-heading">{selected.label}</p>
              <p className="mt-1 text-sm text-cyber-text">
                {selectedInfo.description}
              </p>
              {neighborLabels.length > 0 && (
                <p className="mt-1.5 text-xs text-cyber-muted">
                  Connects to: {neighborLabels.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
        {!selectedId && (
          <p className="text-sm text-cyber-muted">
            Interactive - click any box to inspect what it does and what it
            connects to.
          </p>
        )}
      </div>
    </div>
  );
}

export function FlowLegend() {
  const items: [FlowNodeKind, string][] = [
    ["input", "Input / data"],
    ["model", "AI system"],
    ["gate", "Policy gate"],
    ["risk", "Attack / risk"],
    ["output", "Outcome"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cyber-muted">
      {items.map(([kind, label]) => (
        <span key={kind} className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-sm border",
              kind === "model" && "border-accent bg-accent/15",
              kind === "gate" && "border-amber-500 bg-amber-500/15",
              kind === "risk" && "border-rose-500 bg-rose-500/15",
              kind === "output" && "border-accent bg-accent/25",
              kind === "input" && "border-cyber-border-light bg-cyber-surface-hover"
            )}
          />
          {label}
        </span>
      ))}
    </div>
  );
}