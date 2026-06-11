import Link from "next/link";
import { signIn } from "@/app/(app)/app/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your invoice OCR workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" action={signIn} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
