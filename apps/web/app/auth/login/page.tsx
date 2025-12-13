"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { LoginForm } from "@workspace/ui/components/login-form";
import { signIn, useSession } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(
    null
  );
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle redirect after successful login
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      const hasTenant = (session.user as any)?.tenantId;
      if (hasTenant) {
        router.push("/notes");
      } else {
        router.push("/organization/setup");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form data
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setError(
        validationResult.error.issues?.[0]?.message || "Validation failed"
      );
      setLoading(false);
      return;
    }

    const validatedData = validationResult.data;

    try {
      // Call login API
      const response = await axios.post("/api/auth/login", validatedData);

      if (response.data.user) {
        // If login successful, use NextAuth to create session
        const result = await signIn("credentials", {
          email: validatedData.email,
          password: validatedData.password,
          redirect: false,
        });

        if (result?.ok) {
          // Force a session refresh
          await router.refresh();
          // The useEffect will handle the redirect when session updates
        } else {
          setError("Failed to create session");
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.data?.error === "EmailNotVerified") {
        setError(
          error.response.data.message ||
            "Please verify your email before signing in."
        );
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Network error");
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-up animate-duration-250 w-full max-w-md">
        <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          loading={loading}
          oauthLoading={oauthLoading}
          error={error}
          onSignUp={() => router.push("/auth/register")}
          onForgotPassword={() => router.push("/auth/forgot-password")}
          onGitHubSignIn={async () => {
            setOauthLoading("github");
            try {
              await signIn("github", { callbackUrl: "/auth/complete" });
            } catch (error) {
              setOauthLoading(null);
              setError("GitHub sign-in failed");
            }
          }}
          onGoogleSignIn={async () => {
            setOauthLoading("google");
            try {
              await signIn("google", { callbackUrl: "/auth/complete" });
            } catch (error) {
              setOauthLoading(null);
              setError("Google sign-in failed");
            }
          }}
        />
      </div>
    </div>
  );
}
