import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-sm disabled:opacity-50",
  secondary:
    "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50",
  outline:
    "bg-transparent text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-500 shadow-sm disabled:opacity-50",
  ghost: "text-slate-600 hover:bg-slate-100 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
