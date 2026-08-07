"use client";

import React from "react";
import { GitCompareArrows, Plus, Minus, Check } from "lucide-react";

interface Row {
  type: "same" | "removed" | "added";
  left: string | null;
  right: string | null;
  leftNum: number | null;
  rightNum: number | null;
}

interface Props {
  before: string;
  after: string;
  improvements: string[];
  language: string;
}

function diffRows(before: string, after: string): Row[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const rows: Row[] = [];

  // Simple LCS alignment so unrelated lines stay in order.
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const usedLeft = new Set<number>();
  const usedRight = new Set<number>();
  let i = 0;
  let j = 0;
  const queue: Row[] = [];
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      queue.push({ type: "same", left: a[i], right: b[j], leftNum: i + 1, rightNum: j + 1 });
      usedLeft.add(i);
      usedRight.add(j);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      queue.push({ type: "removed", left: a[i], right: null, leftNum: i + 1, rightNum: null });
      usedLeft.add(i);
      i++;
    } else {
      queue.push({ type: "added", left: null, right: b[j], leftNum: null, rightNum: j + 1 });
      usedRight.add(j);
      j++;
    }
  }
  while (i < a.length) {
    queue.push({ type: "removed", left: a[i], right: null, leftNum: i + 1, rightNum: null });
    usedLeft.add(i);
    i++;
  }
  while (j < b.length) {
    queue.push({ type: "added", left: null, right: b[j], leftNum: null, rightNum: j + 1 });
    usedRight.add(j);
    j++;
  }

  // Merge adjacent same lines to reduce visual noise.
  for (const row of queue) {
    const last = rows[rows.length - 1];
    if (last && row.type === "same" && last.type === "same") {
      last.left = (last.left ?? "") + "\n" + row.left;
      last.right = (last.right ?? "") + "\n" + row.right;
    } else {
      rows.push({ ...row });
    }
  }
  return rows;
}

const LEFT_CLS: Record<Row["type"], string> = {
  same: "text-cyan-100/80",
  removed: "bg-red-950/40 text-red-300",
  added: "bg-slate-900/30 text-cyan-100/80",
};
const RIGHT_CLS: Record<Row["type"], string> = {
  same: "text-cyan-100/80",
  removed: "bg-slate-900/30 text-cyan-100/80",
  added: "bg-emerald-950/40 text-emerald-300",
};

export function FixDiffViewer({ before, after, improvements, language }: Props) {
  const rows = diffRows(before, after);

  return (
    <div className="cyber-panel border border-cyber-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-cyber-border flex items-center gap-2">
        <GitCompareArrows className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyber-heading uppercase tracking-wider font-mono">
          Before / After
        </h3>
        <div className="ml-auto flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-red-300"><Minus className="w-3 h-3" /> vulnerable</span>
          <span className="flex items-center gap-1 text-emerald-300"><Plus className="w-3 h-3" /> secure</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-cyber-border/60 text-[12px] font-mono">
        <div>
          <Header label="Vulnerable code" />
          {rows.map((r, idx) => (
            <Line key={idx} row={r} side="left" cls={LEFT_CLS[r.type]} />
          ))}
        </div>
        <div>
          <Header label="Secure code" />
          {rows.map((r, idx) => (
            <Line key={idx} row={r} side="right" cls={RIGHT_CLS[r.type]} />
          ))}
        </div>
      </div>

      {improvements.length > 0 && (
        <div className="px-4 py-3 border-t border-cyber-border">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 mb-1.5">Improvements applied</div>
          <ul className="space-y-1">
            {improvements.map((im, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-cyber-muted">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{im}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Header({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 bg-slate-900/60 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-cyber-border sticky top-0">
      {label}
    </div>
  );
}

function Line({ row, side, cls }: { row: Row; side: "left" | "right"; cls: string }) {
  const text = side === "left" ? row.left : row.right;
  const num = side === "left" ? row.leftNum : row.rightNum;
  return (
    <div className={`flex ${cls} ${row.type === "same" ? "" : side === "left" ? "" : ""}`}>
      <span className="w-8 shrink-0 select-none text-right pr-2 text-slate-600">{num ?? ""}</span>
      <pre className="flex-1 whitespace-pre-wrap px-1 py-0 leading-[1.6]">{text ?? ""}</pre>
    </div>
  );
}