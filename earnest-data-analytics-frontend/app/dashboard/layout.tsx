"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TaskSkeletonGrid } from "@/components/tasks/TaskSkeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (sessionChecked && !accessToken) {
      router.replace("/login");
    }
  }, [sessionChecked, accessToken, router]);

  if (!sessionChecked) {
    return (
      <div className="min-h-[100dvh] bg-[#f9fafb] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <TaskSkeletonGrid />
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f9fafb] text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
