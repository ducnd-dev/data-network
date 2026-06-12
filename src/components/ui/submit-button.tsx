"use client";

import { useFormStatus } from "react-dom";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { VariantProps } from "class-variance-authority";

type SubmitButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    pendingLabel?: string;
    /** Override useFormStatus when the form uses useActionState */
    pending?: boolean;
  };

export function SubmitButton({
  children,
  pendingLabel,
  pending: pendingOverride,
  disabled,
  className,
  variant,
  size,
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingOverride ?? formPending;

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {pending && <Spinner className="size-4" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
