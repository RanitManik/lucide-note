"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ForgotPasswordForm } from "@workspace/ui/components/forgot-password-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form data
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setError(
        validationResult.error.issues?.[0]?.message || "Validation failed"
      );
      setLoading(false);
      return;
    }

    const validatedData = validationResult.data;

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          "If an account with that email exists, we've sent you a password reset link."
        );
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-fade-up animate-duration-250 w-full max-w-md">
        <ForgotPasswordForm
          email={email}
          onEmailChange={setEmail}
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
