"use client";

import { useActionState } from "react";
import { createTopicAction, type ForumFormState } from "@/app/forum/actions";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ForumFormState = { message: null };

export function ForumTopicForm({ boardSlug }: { boardSlug: string }) {
  const [state, action, pending] = useActionState(createTopicAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="board" value={boardSlug} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="title">Topic</Label>
        <Input id="title" name="title" required minLength={8} maxLength={140} />
      </div>
      <div className="grid gap-1.5">
        <Label>First post</Label>
        <RichTextEditor name="body" placeholder="Write the opening post…" />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Posting…" : "Start topic"}
      </Button>
    </form>
  );
}
