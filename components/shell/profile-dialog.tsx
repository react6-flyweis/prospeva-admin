"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateProfile } from "@/lib/api/queries";
import { profileSchema, type ProfileValues } from "@/lib/forms";
import { useAuth } from "@/lib/stores/auth";

/** Edit the signed-in admin's name, email and phone (PUT /update). */
export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My profile</DialogTitle>
          <DialogDescription>Update the name and contact details on your admin account.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts from the current account each time. */}
        {open && <ProfileForm onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts.slice(0, -1).join(" ") || parts[0] || "", lastName: parts.length > 1 ? parts[parts.length - 1] : "" };
}

function ProfileForm({ onDone }: { onDone: () => void }) {
  const user = useAuth((s) => s.user);
  const update = useUpdateProfile();
  const fallback = splitName(user?.fullName);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      // The API's firstName sometimes holds the full name, so prefer splitting fullName when lastName is in it.
      firstName: user?.firstName && user.firstName !== user.fullName ? user.firstName : fallback.firstName,
      lastName: user?.lastName || fallback.lastName,
      email: user?.email ?? "",
      phone: user?.mobileNumber ?? "",
    },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ phone, ...v }) => {
    try {
      await update.mutateAsync({ ...v, fullName: `${v.firstName} ${v.lastName}`, ...(phone ? { phone } : {}) });
      onDone();
    } catch {
      // The mutation toasts and exposes the error below.
    }
  });

  const field = (name: keyof ProfileValues, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <Field className="form-field" data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={`profile-${name}`} className="font-normal">
        {label}
      </FieldLabel>
      <Input id={`profile-${name}`} aria-invalid={!!errors[name]} {...props} {...form.register(name)} />
      <FieldError className="form-error" errors={[errors[name]]} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="contents">
        <div className="grid grid-cols-2 gap-3">
          {field("firstName", "First name", { autoComplete: "given-name" })}
          {field("lastName", "Last name", { autoComplete: "family-name" })}
        </div>
        {field("email", "Email", { type: "email", autoComplete: "email" })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
        {update.error && (
          <p className="form-error" role="alert">
            {update.error.message}
          </p>
        )}
        <DialogFooter>
          <Button type="submit">
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </fieldset>
    </form>
  );
}
