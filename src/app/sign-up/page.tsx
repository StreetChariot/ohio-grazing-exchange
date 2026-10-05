import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free account to post listings and contact other members.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : "/account");
  const account = await getAccount();
  if (account) redirect(next);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            No paid plan. A free member account lets you post land or livestock
            and see contact details, the way the Midwest exchange works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-up" next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
