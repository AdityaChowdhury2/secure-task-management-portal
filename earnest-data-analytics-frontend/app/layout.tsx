import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Providers } from "@/redux/providers";
import { ClientLayout } from "@/app/client-layout";

export const metadata: Metadata = {
  title: "Earnest Dashboard",
  description: "Task dashboard with secure JWT auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full bg-[#f9fafb] text-slate-900 antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <ToastContainer position="top-right" autoClose={2500} newestOnTop />
        </Providers>
      </body>
    </html>
  );
}
