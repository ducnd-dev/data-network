import Link from "next/link";
import { signUp } from "@/app/(app)/app/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="font-display text-xl">Create account</CardTitle>
          <CardDescription>Start with 20 free OCR pages per month</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" action={signUp} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
