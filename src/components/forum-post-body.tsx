import { looksLikeHtml, sanitizeForumHtml } from "@/lib/forum-html";

export function ForumPostBody({ body }: { body: string }) {
  if (!looksLikeHtml(body)) {
    return <p className="whitespace-pre-wrap text-sm leading-6">{body}</p>;
  }
  const html = sanitizeForumHtml(body);
  return (
    <div
      className="forum-prose text-sm leading-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
