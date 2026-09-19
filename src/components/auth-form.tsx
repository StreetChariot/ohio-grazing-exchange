"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/app/auth/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = { message: null };

export function AuthForm({
  mode,
  next,
  banner,
}: {
  mode: "sign-in" | "sign-up";
  next: string;
  banner?: string | null;
}) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const message = state.message ?? banner ?? null;

  return (
    <form action={formAction} className="grid gap-4">
      {message ? (
        <Alert variant={message.startsWith("Check your email") ? "default" : "destructive"}>
          <AlertTitle>
            {message.startsWith("Check your email") ? "Confirm your email" : "Could not continue"}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="next" value={next} />

      {mode === "sign-up" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="displayName">Name</Label>
          <Input id="displayName" name="displayName" required minLength={2} maxLength={80} />
        </div>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "sign-up" ? 8 : 1}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Working…" : mode === "sign-in" ? "Log in" : "Create account"}
      </Button>

      <p className="text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            No account yet?{" "}
            <Link className="text-primary underline-offset-4 hover:underline" href={`/sign-up?next=${encodeURIComponent(next)}`}>
              Create one
            </Link>
          </>
        ) : (
          <>
            Already a member?{" "}
            <Link className="text-primary underline-offset-4 hover:underline" href={`/sign-in?next=${encodeURIComponent(next)}`}>
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
