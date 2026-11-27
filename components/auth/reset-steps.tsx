"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  forgotEmailSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotEmailValues,
  type OtpValues,
  type ResetPasswordValues,
} from "@/lib/forms";

type StepProps<T> = { onSubmit: (v: T) => Promise<unknown>; error?: string };

function SubmitError({ error }: { error?: string }) {
  return error ? (
    <p className="form-error" role="alert">
      {error}
    </p>
  ) : null;
}

/** Step 1: ask for the account email. */
export function EmailStep({ onSubmit, error, defaultEmail }: StepProps<ForgotEmailValues> & { defaultEmail: string }) {
  const form = useForm<ForgotEmailValues>({ resolver: zodResolver(forgotEmailSchema), defaultValues: { email: defaultEmail } });
  const { errors, isSubmitting } = form.formState;
  return (
    <form onSubmit={form.handleSubmit((v) => onSubmit(v).catch(() => {}))} noValidate aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <Field className="form-field" data-invalid={!!errors.email}>
          <FieldLabel htmlFor="reset-email" className="font-normal">
            Email
          </FieldLabel>
          <Input id="reset-email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...form.register("email")} />
          <FieldError className="form-error" errors={[errors.email]} />
        </Field>
        <SubmitError error={error} />
        <Button type="submit" className="w-full">
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Sending code…" : "Send code"}
        </Button>
      </fieldset>
    </form>
  );
}

/** Step 2: verify the emailed code. */
export function OtpStep({ onSubmit, error, onResend }: StepProps<OtpValues> & { onResend: () => Promise<unknown> }) {
  const form = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
  const { errors, isSubmitting } = form.formState;
  return (
    <form onSubmit={form.handleSubmit((v) => onSubmit(v).catch(() => {}))} noValidate aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <Field className="form-field" data-invalid={!!errors.otp}>
          <FieldLabel htmlFor="reset-otp" className="font-normal">
            Verification code
          </FieldLabel>
          <Input
            id="reset-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-invalid={!!errors.otp}
            {...form.register("otp")}
          />
          <FieldError className="form-error" errors={[errors.otp]} />
        </Field>
        <SubmitError error={error} />
        <Button type="submit" className="w-full">
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Verifying…" : "Verify code"}
        </Button>
        <Button type="button" variant="link" className="w-full" onClick={() => onResend().catch(() => {})}>
          Send a new code
        </Button>
      </fieldset>
    </form>
  );
}

/** Step 3: set the new password. */
export function NewPasswordStep({ onSubmit, error }: StepProps<ResetPasswordValues>) {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const { errors, isSubmitting } = form.formState;
  return (
    <form onSubmit={form.handleSubmit((v) => onSubmit(v).catch(() => {}))} noValidate aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <Field className="form-field" data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="reset-new" className="font-normal">
            New password
          </FieldLabel>
          <Input
            id="reset-new"
            type="password"
            autoComplete="new-password"
            autoFocus
            aria-invalid={!!errors.newPassword}
            {...form.register("newPassword")}
          />
          <FieldError className="form-error" errors={[errors.newPassword]} />
        </Field>
        <Field className="form-field" data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="reset-confirm" className="font-normal">
            Confirm new password
          </FieldLabel>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          <FieldError className="form-error" errors={[errors.confirmPassword]} />
        </Field>
        <SubmitError error={error} />
        <Button type="submit" className="w-full">
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Saving…" : "Set new password"}
        </Button>
      </fieldset>
    </form>
  );
}
