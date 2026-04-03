"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRegisterMutation } from "@/redux/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onValidSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }).unwrap();
      toast.success("Account created — sign in to continue");
      router.replace("/login");
    } catch {
      toast.error("Could not register. Try a different email.");
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f9fafb] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register to start managing tasks.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit(onValidSubmit)}
          noValidate
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              className={errors.name ? "border-red-300 focus:ring-red-100" : ""}
              {...register("name", {
                required: "Name is required",
                validate: (v) =>
                  v.trim().length > 0 || "Name is required",
              })}
            />
            {errors.name ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
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
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              className={
                errors.password ? "border-red-300 focus:ring-red-100" : ""
              }
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Use at least 6 characters",
                },
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
            {isLoading ? "Creating…" : "Register"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
