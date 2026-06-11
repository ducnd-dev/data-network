import Link from "next/link";
import { signIn } from "@/app/(app)/app/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout>
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="font-display text-xl">Sign in</CardTitle>
          <CardDescription>Access your invoice OCR workspace</CardDescription>
        </CardHeader>
        <CardContent>
          {params.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{params.error}</AlertDescription>
            </Alert>
          )}
          <AuthForm mode="login" action={signIn} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up free
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
