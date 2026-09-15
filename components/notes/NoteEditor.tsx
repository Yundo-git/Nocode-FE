import { useCallback, useMemo, useRef } from "react";
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems, type Block } from "@blocknote/core";
import { ko } from "@blocknote/core/locales";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { defaultInlineContentSpecs } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { subPageBlock } from "@/components/notes/subPageBlock";
import { serverMention } from "@/components/notes/serverMention";
import { personMention } from "@/components/notes/personMention";
import { BlockAuthorTag, type BlockAuthors } from "@/components/notes/BlockAuthorTag";
import { useMentionPeople, useMentionServers } from "@/lib/notes/useMentionServers";
import { useTheme } from "@/lib/theme";
import { TEMPLATE_LABEL, type TemplateId } from "@/lib/notes/types";

const LIGHT = {
  editor: { text: "#1d1533", background: "#ffffff" },
  menu: { text: "#1d1533", background: "#ffffff" },
  tooltip: { text: "#1d1533", background: "#f3eefb" },
  hovered: { text: "#1d1533", background: "#f0e9fb" },
  selected: { text: "#ffffff", background: "#6926c9" },
  disabled: { text: "#6b6088", background: "#f3eefb" },
  shadow: "#d2c6e6",
  border: "#e6dff2",
  sideMenu: "#6b6088",
} as const;

const DARK = {
  editor: { text: "#ece7f6", background: "#1c1730" },
  menu: { text: "#ece7f6", background: "#1c1730" },
  tooltip: { text: "#ece7f6", background: "#171226" },
  hovered: { text: "#ece7f6", background: "#241d3a" },
  selected: { text: "#ffffff", background: "#7c3aed" },
  disabled: { text: "#9a8fb2", background: "#171226" },
  shadow: "#000000",
  border: "#322a4a",
  sideMenu: "#9a8fb2",
} as const;

const THEME = {
  light: { colors: LIGHT, borderRadius: 6, fontFamily: "inherit" },
  dark: { colors: DARK, borderRadius: 6, fontFamily: "inherit" },
} as const;

const { video, audio, file, ...blocks } = defaultBlockSpecs;

const SCHEMA = BlockNoteSchema.create({
  blockSpecs: { ...blocks, subpage: subPageBlock() },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    serverMention,
    personMention,
  },
});

export type EditorActions = {
  toMarkdown: () => Promise<string>;
  fromMarkdown: (text: string) => Promise<void>;
};

type NoteEditorProps = {
  noteId: string;
  initialContent: unknown;
  onChange: (content: unknown) => void;
  onCreateChild: (title: string, template?: TemplateId) => Promise<string>;
  actionsRef: { current: EditorActions | null };
  editable: boolean;
  blockAuthors: BlockAuthors;
  showAuthors: boolean;
};

export default function NoteEditor({
  noteId,
  initialContent,
  onChange,
  onCreateChild,
  actionsRef,
  editable,
  blockAuthors,
  showAuthors,
}: NoteEditorProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const servers = useMentionServers();
  const people = useMentionPeople();

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const token = document.cookie
        .split("; ")
        .find((part) => part.startsWith("pingcheck_csrf="));

      const res = await fetch(
        `/api/notes/${noteId}/files?name=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            ...(token === undefined
              ? {}
              : { "X-CSRF-Token": decodeURIComponent(token.split("=")[1] ?? "") }),
          },
          body: file,
          credentials: "include",
        },
      );

      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "message" in body
            ? String((body as { message: unknown }).message)
            : "그림을 올리지 못했습니다.";

        throw new Error(message);
      }

      const data = (await res.json()) as { id: string };

      return `/api/notes/files/${data.id}`;
    },
    [noteId],
  );

  const content = useMemo(() => {
    return Array.isArray(initialContent) && initialContent.length > 0
      ? (initialContent as Block[])
      : undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: content,
    dictionary: ko,
    schema: SCHEMA,
    uploadFile,
  });

  actionsRef.current = {
    toMarkdown: async () => editor.blocksToMarkdownLossy(editor.document),
    fromMarkdown: async (text: string) => {
      const parsed = await editor.tryParseMarkdownToBlocks(text);

      editor.replaceBlocks(editor.document, parsed);
      onChange(editor.document);
    },
  };

  const items = useCallback(
    async (query: string) => {
      const makePage = (template?: TemplateId) => () => {
        const inserted = editor.insertBlocks(
          [{ type: "subpage", props: { noteId: "" } }],
          editor.getTextCursorPosition().block,
          "after",
        );

        const block = inserted[0];

        if (block === undefined) return;

        void onCreateChild("", template).then((childId) => {
          if (childId === "") return;

          editor.updateBlock(block, { props: { noteId: childId } });
          onChange(editor.document);
        });
      };

      const pageItems = [
        {
          title: "페이지",
          subtext: "이 메모 안에 빈 하위 페이지를 만듭니다",
          aliases: ["page", "페이지", "하위", "subpage"],
          group: "기본 블록",
          onItemClick: makePage(),
        },
        ...(["todo", "notice"] as const).map((id) => ({
          title: `페이지 · ${TEMPLATE_LABEL[id]}`,
          subtext: `${TEMPLATE_LABEL[id]} 서식으로 하위 페이지를 만듭니다`,
          aliases: ["page", "페이지", "하위", "서식", TEMPLATE_LABEL[id]],
          group: "기본 블록",
          onItemClick: makePage(id),
        })),
      ];

      return filterSuggestionItems(
        [...getDefaultReactSlashMenuItems(editor), ...pageItems],
        query,
      );
    },
    [editor, onChange, onCreateChild],
  );

  const mentions = useCallback(
    async (query: string) => {
      const needle = query.trim().toLowerCase();

      const peopleItems = people
        .filter(
          (person) =>
            needle === "" ||
            person.name.toLowerCase().includes(needle) ||
            person.loginId.toLowerCase().includes(needle),
        )
        .slice(0, 10)
        .map((person) => ({
          title: person.name,
          subtext: person.loginId,
          group: "사람",
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "personMention",
                props: {
                  accountId: person.id,
                  loginId: person.loginId,
                  name: person.name,
                },
              },
              " ",
            ]);
          },
        }));

      const serverItems = servers
        .filter(
          (server) =>
            needle === "" ||
            server.ip.includes(needle) ||
            server.nameKo.toLowerCase().includes(needle) ||
            server.nameEn.toLowerCase().includes(needle),
        )
        .slice(0, 15)
        .map((server) => ({
          title: server.nameKo,
          subtext: `${server.ip} · ${server.nameEn}`,
          group: "장비",
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: "serverMention",
                props: {
                  serverId: server.id,
                  ip: server.ip,
                  nameKo: server.nameKo,
                },
              },
              " ",
            ]);
          },
        }));

      return [...peopleItems, ...serverItems];
    },
    [editor, people, servers],
  );

  return (
    <div ref={boxRef} className="relative">
      {showAuthors ? (
        <BlockAuthorTag editor={editor} authors={blockAuthors} containerRef={boxRef} />
      ) : null}

    <BlockNoteView
      editor={editor}
      editable={editable}
      theme={theme === "dark" ? THEME.dark : THEME.light}
      onChange={() => onChange(editor.document)}
      slashMenu={false}
      className="note-editor"
    >
      <SuggestionMenuController triggerCharacter="/" getItems={items} />
      <SuggestionMenuController triggerCharacter="@" getItems={mentions} />
    </BlockNoteView>
    </div>
  );
}
