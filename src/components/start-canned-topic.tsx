"use client";

import { useActionState } from "react";
import { startCannedTopicAction, type ForumFormState } from "@/app/forum/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: ForumFormState = { message: null };

export function StartCannedTopic({
  boardSlug,
  title,
  body,
}: {
  boardSlug: string;
  title: string;
  body: string;
}) {
  const [state, action, pending] = useActionState(startCannedTopicAction, initialState);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="board" value={boardSlug} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="body" value={body} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" size="sm" disabled={pending} className="w-fit">
        {pending ? "Opening…" : "Start this thread"}
      </Button>
    </form>
  );
}
