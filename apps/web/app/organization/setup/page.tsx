"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSession } from "next-auth/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Loader2,
  CheckCircle,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  organizationSchema,
  createOrganizationSchema,
  type OrganizationInput,
  type CreateOrganizationInput,
} from "@/lib/validations";
const Confetti = React.lazy(() => import("react-confetti"));

type SetupState = "form" | "success";

export default function OrganizationSetupPage() {
  const [state, setState] = useState<SetupState>("form");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // Check if user already has a tenant
    if ((session?.user as any)?.tenantId) {
      router.push("/notes");
      return;
    }

    setCheckingAuth(false);
  }, [session, status, router]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationResult = createOrganizationSchema.safeParse({
      name: organizationName.trim(),
    });

    if (!validationResult.success) {
      setError(
        validationResult.error.issues?.[0]?.message || "Validation failed"
      );
      return;
    }

    const validatedData = validationResult.data;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/organization/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        const data = await response.json();
        // Update session with the returned user data
        await update({
          user: {
            tenantId: data.user.tenantId,
            tenantSlug: data.user.tenantSlug,
            tenantPlan: data.user.tenantPlan,
            role: data.user.role,
          },
        });
        setState("success");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create organization");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToNotes = () => {
    router.push("/notes");
  };

  if (checkingAuth) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <React.Suspense fallback={null}>
          <Confetti
            width={typeof window !== "undefined" ? window.innerWidth : 1920}
            height={typeof window !== "undefined" ? window.innerHeight : 1080}
            numberOfPieces={300}
            gravity={0.08}
            colors={[
              "#10b981",
              "#059669",
              "#047857",
              "#0d9488",
              "#0891b2",
              "#0284c7",
              "#2563eb",
            ]}
          />
        </React.Suspense>
        <div className="animate-fade-up animate-duration-500 z-10 w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Organization Created!</h1>
                <p className="text-muted-foreground">
                  Welcome to {organizationName}. You're all set to start
                  creating notes.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 border-primary/20 rounded-xl border p-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Sparkles className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-primary text-lg font-semibold">
                      Ready to get started?
                    </h3>
                    <p className="text-muted-foreground">
                      Create your first note and start collaborating with your
                      team. You can always invite more members later.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleGoToNotes} className="w-full" size="lg">
                Create Your First Note
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-up animate-duration-250 w-full max-w-md">
        <form
          onSubmit={handleCreateOrganization}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <img
              src="/logo.svg"
              alt="lucide note Logo"
              className="mx-auto h-12 w-12"
            />
            <h1 className="text-2xl font-bold">Create Your Organization</h1>
            <p className="text-muted-foreground text-balance text-sm">
              Set up your workspace to start collaborating on notes with your
              team.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Corp"
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <p className="text-muted-foreground text-sm">
                This will be visible to your team members and can be changed
                later.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !organizationName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
