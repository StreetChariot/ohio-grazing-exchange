"use client";

import { useActionState } from "react";
import { createPostAction, type ForumFormState } from "@/app/forum/actions";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState: ForumFormState = { message: null };

export function ForumReplyForm({ topicId, nextPath }: { topicId: string; nextPath: string }) {
  const [state, action, pending] = useActionState(createPostAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="next" value={nextPath} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-1.5">
        <Label>Reply</Label>
        <RichTextEditor name="body" placeholder="Write a reply…" minHeightClass="min-h-28" />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Posting…" : "Post reply"}
      </Button>
    </form>
  );
}
