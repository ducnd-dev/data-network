"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<{ error: string } | void>;
};

function AuthFormFields({
  mode,
  error,
}: {
  mode: "login" | "signup";
  error: string | null;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      {mode === "signup" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organisation name</Label>
            <Input id="orgName" name="orgName" required disabled={pending} />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          disabled={pending}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SubmitButton className="w-full" pendingLabel="Please wait…">
        {mode === "login" ? "Sign in" : "Create account"}
      </SubmitButton>
    </>
  );
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setError(null);
        const result = await action(formData);
        if (result?.error) {
          setError(result.error);
        }
      }}
    >
      <AuthFormFields mode={mode} error={error} />
    </form>
  );
}
