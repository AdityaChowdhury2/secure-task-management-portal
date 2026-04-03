"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

const navItems = [
  { href: "/dashboard", label: "Tasks", short: "Tasks" },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logout().unwrap();
      toast.success("Signed out");
    } catch {
      toast.error("Sign out request failed; session cleared locally");
    } finally {
      router.replace("/login");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#f9fafb] md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Earnest
          </span>
          <p className="mt-0.5 text-xs text-slate-500">Task workspace</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 md:hidden">
              Earnest
            </p>
            <p className="hidden text-xs text-slate-500 md:block">Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button
              variant="secondary"
              className="shrink-0 rounded-xl px-3 py-2 text-xs sm:text-sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "…" : "Logout"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md md:hidden safe-area-pb">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-xs font-medium ${active ? "text-slate-900" : "text-slate-500"
                }`}
            >
              <span
                className={`mb-0.5 h-1.5 w-1.5 rounded-full ${active ? "bg-slate-900" : "bg-transparent"
                  }`}
              />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
