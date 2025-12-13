"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import NextTopLoader from "nextjs-toploader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AuthRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    // Only handle redirects for authenticated users without tenants
    // Middleware handles most redirects, this is for client-side session changes
    if (status === "authenticated" && session?.user) {
      const hasTenant = (session.user as any)?.tenantId;
      const isOrgSetupPage = pathname?.startsWith("/organization/setup");

      // If user doesn't have tenant and isn't on setup page, redirect to setup
      if (!hasTenant && !isOrgSetupPage && pathname !== "/") {
        router.push("/organization/setup");
        return;
      }
    }
  }, [session, status, router, pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextTopLoader color="#155dfb" showSpinner={false} />
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <AuthRedirectHandler />
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
