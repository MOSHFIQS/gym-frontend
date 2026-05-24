"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/auth/signin");
      return;
    }

    if (user.role === "MEMBER" && pathname.startsWith("/admin")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="text-accent font-black text-4xl italic tracking-tight animate-pulse">
          Fitness
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (user.role === "MEMBER" && pathname.startsWith("/admin")) return null;

  return <>{children}</>;
}
