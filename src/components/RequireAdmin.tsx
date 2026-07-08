"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/lib/store";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser());
  const hydrated = useAppStore.persist?.hasHydrated ? useAppStore.persist.hasHydrated() : true;

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace("/login");
    } else if (hydrated && currentUser && !currentUser.isAdmin) {
      router.replace("/dashboard");
    }
  }, [hydrated, currentUser, router]);

  if (!currentUser || !currentUser.isAdmin) return null;

  return <>{children}</>;
}
