import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to post listings and see contact details.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : "/account");
  const account = await getAccount();
  if (account) redirect(next);

  const banner =
    params.error === "auth"
      ? "That sign-in link did not work. Try logging in again."
      : null;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            Free, same as the Midwest exchange. Members can post, and can see
            names and phone numbers on listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-in" next={next} banner={banner} />
        </CardContent>
      </Card>
    </main>
  );
}
