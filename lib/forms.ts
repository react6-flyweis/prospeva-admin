import { z } from "zod";

// Form schemas (React Hook Form + zodResolver).

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type LoginValues = z.infer<typeof loginSchema>;

const email = z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.");

export const forgotEmailSchema = z.object({ email });
export type ForgotEmailValues = z.infer<typeof forgotEmailSchema>;

export const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{4,8}$/, "Enter the code from the email."),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{7,15}$/, "Enter a phone number with digits only.")
    .or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const ROW_ACTIONS = ["Review", "Approve", "Reject", "Escalate", "Resolve", "Close"] as const;

export const recordActionSchema = z.object({
  action: z.enum(ROW_ACTIONS),
  note: z.string().trim().min(10, "Add a note of at least 10 characters for the audit log.").max(1000),
});
export type RecordActionValues = z.infer<typeof recordActionSchema>;

export const moduleActionFormSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});
export type ModuleActionValues = z.infer<typeof moduleActionFormSchema>;

export const searchSchema = z.object({
  search: z.string().trim().min(2, "Enter at least 2 characters."),
});
export type SearchValues = z.infer<typeof searchSchema>;
