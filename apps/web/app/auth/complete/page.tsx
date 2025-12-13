"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2 } from "lucide-react";

export default function CompletePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      // Check if user has a tenant
      const hasTenant = (session.user as any)?.tenantId;

      if (hasTenant) {
        router.push("/notes");
      } else {
        // User needs to set up organization
        router.push("/organization/setup");
      }
    } else {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
