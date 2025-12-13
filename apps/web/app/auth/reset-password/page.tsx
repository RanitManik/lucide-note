"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@workspace/ui/components/reset-password-form";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations";

function ResetPasswordFormComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    // Validate form data
    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
      token,
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
    setSuccess("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "Password reset successful! You will be redirected to the login page."
        );
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-up animate-duration-250 w-full max-w-md">
        <ResetPasswordForm
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
          onBackToLogin={() => router.push("/auth/login")}
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <img
                  src="/logo.svg"
                  alt="lucide note Logo"
                  className="mx-auto h-12 w-12"
                />
                <h1 className="text-2xl font-bold">Loading...</h1>
                <p className="text-muted-foreground">Please wait</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordFormComponent />
    </Suspense>
  );
}
