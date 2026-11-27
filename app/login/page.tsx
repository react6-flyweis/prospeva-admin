"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSignin } from "@/lib/api/queries";
import { loginSchema, type LoginValues } from "@/lib/forms";

/** Only same-site relative paths are allowed as a post-login redirect. */
function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const signin = useSignin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signin.mutateAsync(values);
      router.replace(nextPath());
    } catch {
      // Shown below from signin.error.
    }
  });

  return (
    <AuthCard title="Admin Control" description="Sign in with your Prospeva staff account.">
      <form onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="contents">
          <Field className="form-field" data-invalid={!!errors.email}>
            <FieldLabel htmlFor="login-email" className="font-normal">
              Email
            </FieldLabel>
            <Input id="login-email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError className="form-error" errors={[errors.email]} />
          </Field>
          <Field className="form-field" data-invalid={!!errors.password}>
            <FieldLabel htmlFor="login-password" className="font-normal">
              Password
            </FieldLabel>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError className="form-error" errors={[errors.password]} />
            <Link href="/forgot-password" className="self-end text-sm underline">
              Forgot password?
            </Link>
          </Field>
          {signin.error && (
            <p className="form-error" role="alert">
              {signin.error.message}
            </p>
          )}
          <Button type="submit" className="w-full">
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </fieldset>
      </form>
    </AuthCard>
  );
}
