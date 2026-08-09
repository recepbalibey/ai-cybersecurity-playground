"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Info,
  XCircle,
  ShieldAlert,
  X,
} from "lucide-react";

export type ToastTone = "success" | "info" | "error" | "warning";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, { border: string; icon: string; Icon: typeof Info }> = {
  success: { border: "border-emerald-500/40", icon: "text-emerald-400", Icon: CheckCircle2 },
  info: { border: "border-cyan-500/40", icon: "text-cyan-400", Icon: Info },
  error: { border: "border-rose-500/40", icon: "text-rose-400", Icon: XCircle },
  warning: { border: "border-amber-500/40", icon: "text-amber-400", Icon: ShieldAlert },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = ++seq.current;
      setToasts((prev) => [...prev.slice(-4), { ...item, id }]);
      window.setTimeout(() => dismiss(id), item.tone === "error" ? 6000 : 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed top-20 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const tone = TONE_STYLE[t.tone ?? "info"];
          const Icon = tone.Icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border ${tone.border} bg-cyber-surface/95 p-3 shadow-2xl backdrop-blur-sm decode-enter`}
              role="status"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.icon}`} strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-cyber-heading">{t.title}</div>
                {t.description && (
                  <div className="mt-0.5 text-[11px] leading-snug text-cyber-muted">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-cyber-muted transition-colors hover:text-cyber-text"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}