"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  codeBlockPlugin,
  codeMirrorPlugin,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
  headingsPlugin,
  InsertCodeBlock,
  InsertTable,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  markdownShortcutPlugin,
  quotePlugin,
  Separator,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { useEffect, useRef } from "react";
import "@mdxeditor/editor/style.css";

interface EditorProps {
  markdown: string;
  onChange?: (markdown: string) => void;
}

const Editor = ({ markdown, onChange }: EditorProps) => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentMarkdown = editorRef.current.getMarkdown();
      if (currentMarkdown !== markdown) {
        isUpdatingRef.current = true;
        editorRef.current.setMarkdown(markdown);
        isUpdatingRef.current = false;
      }
    }
  }, [markdown]);

  return (
    <MDXEditor
      ref={editorRef}
      markdown={markdown}
      contentEditableClassName="mdx-editor-content"
      onChange={() => {
        if (onChange && editorRef.current && !isUpdatingRef.current) {
          onChange(editorRef.current.getMarkdown());
        }
      }}
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper options={["rich-text", "source"]}>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles options={["Strikethrough"]} />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <InsertTable />
              <InsertCodeBlock />
            </DiffSourceToggleWrapper>
          ),
        }),
        diffSourcePlugin({
          viewMode: "rich-text",
        }),
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: "JavaScript",
            jsx: "JavaScript (JSX)",
            ts: "TypeScript",
            tsx: "TypeScript (TSX)",
            css: "CSS",
            html: "HTML",
            json: "JSON",
            md: "Markdown",
            py: "Python",
            sh: "Shell",
            bash: "Bash",
            yml: "YAML",
            yaml: "YAML",
            xml: "XML",
          },
        }),
        markdownShortcutPlugin(),
      ]}
    />
  );
};

export default Editor;
