"use client";

import { useActionState } from "react";
import {
  suggestEducationAction,
  type SuggestFormState,
} from "@/app/education/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EDUCATION_TOPIC_LABELS,
  EDUCATION_TOPICS,
} from "@/lib/education-resources";

const initialSuggestState: SuggestFormState = {
  message: null,
  ok: false,
  fieldErrors: {},
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SuggestEducationForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(
    suggestEducationAction,
    initialSuggestState,
  );
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={action} className="grid gap-4">
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "Suggestion received" : "Could not submit"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="edu-title">Resource title</Label>
        <Input
          id="edu-title"
          name="title"
          required
          maxLength={200}
          placeholder="Fact sheet or article title"
          aria-invalid={Boolean(fieldErrors.title)}
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="edu-url">URL to the original</Label>
        <Input
          id="edu-url"
          name="url"
          type="url"
          required
          maxLength={500}
          placeholder="https://"
          aria-invalid={Boolean(fieldErrors.url)}
        />
        <FieldError message={fieldErrors.url} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="edu-authors">Authors (if known)</Label>
          <Input
            id="edu-authors"
            name="authors"
            maxLength={400}
            placeholder="Name, Name"
          />
          <FieldError message={fieldErrors.authors} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="edu-source">Publisher / Extension</Label>
          <Input
            id="edu-source"
            name="sourceLabel"
            maxLength={200}
            placeholder="e.g. OSU Extension · Ohioline"
          />
          <FieldError message={fieldErrors.sourceLabel} />
        </div>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Themes (optional)</legend>
        <div className="flex flex-wrap gap-3">
          {EDUCATION_TOPICS.map((topic) => (
            <label
              key={topic}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                type="checkbox"
                name="topics"
                value={topic}
                className="size-4 rounded border-border"
              />
              {EDUCATION_TOPIC_LABELS[topic]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="edu-notes">Why it belongs on the shelf</Label>
        <Textarea
          id="edu-notes"
          name="notes"
          rows={3}
          maxLength={1200}
          placeholder="One or two sentences for hosts — what producers learn."
        />
        <FieldError message={fieldErrors.notes} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="edu-name">Your name</Label>
          <Input
            id="edu-name"
            name="submitterName"
            required
            maxLength={80}
            defaultValue={defaultName}
            aria-invalid={Boolean(fieldErrors.submitterName)}
          />
          <FieldError message={fieldErrors.submitterName} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="edu-email">Your email</Label>
          <Input
            id="edu-email"
            name="submitterEmail"
            type="email"
            required
            maxLength={120}
            defaultValue={defaultEmail}
            aria-invalid={Boolean(fieldErrors.submitterEmail)}
          />
          <FieldError message={fieldErrors.submitterEmail} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Suggest for the shelf"}
      </Button>
    </form>
  );
}
