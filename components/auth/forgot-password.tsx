"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailStep, NewPasswordStep, OtpStep } from "@/components/auth/reset-steps";
import { useForgotPassword, useResetPassword, useVerifyResetOtp } from "@/lib/api/queries";

type Step = { name: "email" } | { name: "otp"; email: string } | { name: "password"; id: string };

/** Password reset: email → emailed code → new password. */
export function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "email" });
  const [email, setEmail] = useState("");
  const send = useForgotPassword();
  const verify = useVerifyResetOtp();
  const reset = useResetPassword();

  const sendCode = async (to: string) => {
    const r = await send.mutateAsync(to);
    setEmail(to);
    setStep({ name: "otp", email: to });
    toast.success(r.message || `We sent a code to ${to}.`);
  };

  return (
    <AuthCard
      title="Reset password"
      description={
        step.name === "email"
          ? "Enter your staff email and we will send you a verification code."
          : step.name === "otp"
            ? `Enter the code we sent to ${step.email}.`
            : "Choose a new password for your account."
      }
    >
      {step.name === "email" && (
        <EmailStep defaultEmail={email} error={send.error?.message} onSubmit={(v) => sendCode(v.email)} />
      )}
      {step.name === "otp" && (
        <OtpStep
          error={verify.error?.message ?? send.error?.message}
          onResend={() => sendCode(step.email)}
          onSubmit={async (v) => setStep({ name: "password", id: await verify.mutateAsync({ email: step.email, otp: v.otp }) })}
        />
      )}
      {step.name === "password" && (
        <NewPasswordStep
          error={reset.error?.message}
          onSubmit={async (v) => {
            const r = await reset.mutateAsync({ id: step.id, ...v });
            toast.success(r.message || "Password updated. Sign in with your new password.");
            router.replace("/login");
          }}
        />
      )}
      <p className="mt-4 mb-0 text-center text-sm">
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
