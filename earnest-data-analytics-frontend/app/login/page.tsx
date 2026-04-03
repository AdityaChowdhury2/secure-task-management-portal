"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useLoginMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    console.log(sessionChecked, accessToken);
    if (sessionChecked && accessToken) {

      router.replace("/dashboard");
    }
  }, [sessionChecked, accessToken, router]);

  async function onValidSubmit(values: LoginFormValues) {
    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();
      toast.success("Welcome back");
      router.replace("/dashboard");
    } catch {
      toast.error("Invalid credentials or server error");
    }
  }

  if (!sessionChecked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f9fafb] text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
      </div>
    );
  }

  if (accessToken) {
    return null;
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f9fafb] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your account to access the dashboard.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              className={errors.email ? "border-red-300 focus:ring-red-100" : ""}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              className={
                errors.password ? "border-red-300 focus:ring-red-100" : ""
              }
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className="mt-2 w-full rounded-xl py-3"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
