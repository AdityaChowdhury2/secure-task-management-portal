"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "earnest-task-mgmt-tutorial-done";

const STEPS = [
  {
    id: "new-task",
    title: "Create a new task",
    body: "Click New Task, enter a title (and optional details), then Create Task. New items appear in your table right away.",
  },
  {
    id: "search-filter",
    title: "Search and filter",
    body: "Use Quick Search to find tasks by title. Use Filter View to show only Pending, In Progress, or Completed tasks.",
  },
  {
    id: "row-actions",
    title: "Mark done and manage rows",
    body: "The check button toggles completion (pending ↔ done). The pencil opens edit (you can also change status there). The trash icon deletes the task after you confirm.",
  },
] as const;

export function TaskBoardTutorial() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  const current = STEPS[step];
  const selector = `[data-tutorial="${current.id}"]`;

  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (!open || typeof window === "undefined") return;
    const el = document.querySelector(selector);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [open, selector]);

  useLayoutEffect(() => {
    updateRect();
  }, [updateRect]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(updateRect, 100);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);

  if (!mounted || !open) return null;

  const isLast = step === STEPS.length - 1;
  const pad = 10;

  const overlayClipPath =
    rect && typeof window !== "undefined"
      ? (() => {
          const t = rect.top - pad;
          const l = rect.left - pad;
          const b = rect.bottom + pad;
          const rgt = rect.right + pad;
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          return `polygon(evenodd, 0px 0px, ${vw}px 0px, ${vw}px ${vh}px, 0px ${vh}px, 0px 0px, ${l}px ${t}px, ${l}px ${b}px, ${rgt}px ${b}px, ${rgt}px ${t}px, ${l}px ${t}px)`;
        })()
      : undefined;

  const ringStyle = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  /** Match modal width to `22rem` cap but never exceed innerWidth (avoids 100vw + scrollbar overflow). */
  const margin = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 384;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const cardWidth = Math.min(22 * 16, Math.max(0, vw - margin * 2));

  let cardStyle: CSSProperties = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: cardWidth,
  };

  if (rect) {
    const gap = 16;
    const cardH = 220;
    let top = rect.bottom + gap;
    if (top + cardH > vh - margin) {
      top = Math.max(margin, rect.top - cardH - gap);
    }
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(margin, Math.min(left, vw - cardWidth - margin));
    cardStyle = {
      top: `${top}px`,
      left: `${left}px`,
      transform: "none",
      width: cardWidth,
    };
  }

  return createPortal(
    <div
      className="fixed inset-0 z-1000 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-tutorial-title"
      aria-describedby="task-tutorial-desc"
    >
      <div
        className="absolute inset-0 bg-slate-900/70 pointer-events-auto transition-[clip-path] duration-200 ease-out"
        style={overlayClipPath ? { clipPath: overlayClipPath } : undefined}
        aria-hidden
      />

      {ringStyle && (
        <div
          className="fixed z-1001 rounded-xl ring-4 ring-indigo-400 ring-offset-2 ring-offset-white/10 pointer-events-none transition-all duration-200 ease-out"
          style={ringStyle}
          aria-hidden
        />
      )}

      <div
        className="fixed z-1002 box-border max-w-none rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl pointer-events-auto"
        style={cardStyle}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 mb-1">
          Quick tour · Step {step + 1} of {STEPS.length}
        </p>
        <h2 id="task-tutorial-title" className="text-lg font-bold text-slate-900 mb-2">
          {current.title}
        </h2>
        <p id="task-tutorial-desc" className="text-sm text-slate-600 leading-relaxed mb-5">
          {current.body}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" className="text-slate-600" onClick={finish}>
            Skip tour
          </Button>
          <Button className="bg-slate-900 border-0 px-5" onClick={isLast ? finish : () => setStep((s) => s + 1)}>
            {isLast ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
