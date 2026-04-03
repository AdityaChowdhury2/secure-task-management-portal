"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export default function Home() {
  const router = useRouter();
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!sessionChecked) return;
    router.replace(accessToken ? "/dashboard" : "/login");
  }, [sessionChecked, accessToken, router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f9fafb] text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
    </div>
  );
}
