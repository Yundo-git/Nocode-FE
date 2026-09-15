import { useMemo, useState } from "react";
import { PlusIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";
import { BUSINESS_DIVISION_LABEL, type BusinessDivisionId } from "@/lib/businessDivisions";
import { useMentionPeople } from "@/lib/notes/useMentionServers";
import type { Workspace } from "@/lib/notes/types";

type MemberBarProps = {
  workspace: Workspace;
  myId: string;
  onInvite: (accountId: string) => void;
  onExpel: (accountId: string) => void;
};

export function MemberBar({ workspace, myId, onInvite, onExpel }: MemberBarProps) {
  const people = useMentionPeople(true);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const already = useMemo(
    () => new Set(workspace.members.map((m) => m.id)),
    [workspace.members],
  );

  const candidates = people
    .filter((person) => !already.has(person.id))
    .filter(
      (person) =>
        keyword.trim() === "" ||
        person.name.includes(keyword.trim()) ||
        person.loginId.includes(keyword.trim()),
    )
    .slice(0, 20);

  const label = (divisionId: string) =>
    BUSINESS_DIVISION_LABEL[divisionId as BusinessDivisionId] ?? divisionId;

  return (
    <div className="panel flex flex-wrap items-center gap-2 px-3 py-2">
      <UsersIcon width={15} height={15} className="shrink-0 text-muted" />
      <span className="shrink-0 text-bt-text-s text-muted">
        멤버 {workspace.members.length}명
      </span>

      {workspace.members.map((member) => (
        <span
          key={member.id}
          className="flex items-center gap-1 rounded border border-line-strong px-1.5 py-0.5 text-bt-text-s text-body"
        >
          {member.name}
          <span className="text-muted/70">{label(member.divisionId)}</span>
          {member.id === workspace.ownerId ? (
            <span className="text-primary-600">만든이</span>
          ) : workspace.canManage || member.id === myId ? (
            <button
              type="button"
              onClick={() => onExpel(member.id)}
              title={member.id === myId ? "나가기" : "내보내기"}
              aria-label={`${member.name} ${member.id === myId ? "나가기" : "내보내기"}`}
              className="rounded text-muted transition hover:text-down-500"
            >
              <TrashIcon width={12} height={12} />
            </button>
          ) : null}
        </span>
      ))}

      {workspace.canManage ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            className="btn btn-ghost btn-sm"
          >
            <PlusIcon width={14} height={14} />초대
          </button>

          {open ? (
            <div className="panel absolute left-0 top-[calc(100%+4px)] z-20 w-[260px] p-2 shadow-soft">
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.currentTarget.value)}
                placeholder="이름·아이디로 찾기"
                aria-label="초대할 사람 찾기"
                className="input input-sm mb-1 w-full"
              />

              <div className="max-h-[220px] overflow-y-auto">
                {candidates.length === 0 ? (
                  <p className="px-2 py-3 text-center text-bt-text-s text-muted">
                    더 초대할 사람이 없습니다.
                  </p>
                ) : (
                  candidates.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setKeyword("");
                        onInvite(person.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition hover:bg-row-hover"
                    >
                      <span className="min-w-0 flex-1 truncate text-b2_body_r text-body">
                        {person.name}
                      </span>
                      <span className="shrink-0 text-bt-text-s text-muted/70">
                        {person.loginId}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
