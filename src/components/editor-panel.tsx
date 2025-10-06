"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function EditorPanel() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p><strong>Proposal Draft</strong></p><p>Start writing here...</p>",
    immediatelyRender: false,
  });

  return (
    <div className="flex-1 flex flex-col">
      <div className="mt-3 flex-1 rounded border border-foreground/20 overflow-auto bg-black/5 dark:bg-white/5 p-2">
        {editor ? <EditorContent editor={editor} /> : null}
      </div>
    </div>
  );
}


