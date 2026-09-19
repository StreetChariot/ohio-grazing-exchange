"use client";

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { FORUM_EMOJI } from "@/lib/forum-icons";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  defaultHtml?: string;
  minHeightClass?: string;
};

export function RichTextEditor({
  name,
  placeholder = "Write your post…",
  defaultHtml = "",
  minHeightClass = "min-h-36",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultHtml || "<p></p>",
    editorProps: {
      attributes: {
        class: cn(
          "tiptap forum-prose max-w-none px-3 py-2 text-sm leading-6 focus:outline-none",
          minHeightClass,
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const input = document.getElementById(`${name}-html`) as HTMLInputElement | null;
      if (input) input.value = editor.getHTML();
    };
    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor, name]);

  if (!editor) {
    return (
      <>
        <input type="hidden" id={`${name}-html`} name={name} defaultValue={defaultHtml || "<p></p>"} />
        <div className={cn("rounded-md border bg-muted/30", minHeightClass)} />
      </>
    );
  }

  return (
    <div className="grid gap-2">
      <input type="hidden" id={`${name}-html`} name={name} defaultValue={editor.getHTML()} />
      <div className="flex flex-wrap gap-1 rounded-md border border-border/80 bg-muted/20 p-1">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const href = window.prompt("Link URL");
            if (!href) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
          }}
        >
          Link
        </ToolbarButton>
      </div>
      <div className="flex flex-wrap gap-1">
        {FORUM_EMOJI.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="rounded px-1.5 py-0.5 text-base hover:bg-muted"
            onClick={() => editor.chain().focus().insertContent(emoji).run()}
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-input bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-7 px-2 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
