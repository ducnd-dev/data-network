import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <FadeIn>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
        <div className="prose prose-sm mt-10 max-w-none space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
      </FadeIn>
    </div>
  );
}
