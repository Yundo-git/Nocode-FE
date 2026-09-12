import type { CSSProperties } from "react";
import { formatClock, formatDuration } from "@/lib/monitoring/format";
import type { Incident, IncidentKind } from "@/lib/monitoring/types";

// 장애 종류별 배지 색상입니다. 클래스 이름은 통째로 적습니다.
const KIND_CLASS: Record<IncidentKind, string> = {
  down: "badge badge-down",
  warning: "badge badge-warning",
  recovered: "badge badge-up",
};

const KIND_LABEL: Record<IncidentKind, string> = {
  down: "DOWN",
  warning: "WARNING",
  recovered: "RECOVERED",
};

// 줄 왼쪽에 표시할 색입니다.
const KIND_TONE: Record<IncidentKind, string> = {
  down: "var(--down-500)",
  warning: "var(--warn-500)",
  recovered: "var(--up-500)",
};

// 최근 장애와 복구 이력을 보여 줍니다.
export function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-head">
        <h2 className="text-bt-text-large font-semibold text-main">
          Recent Incidents
        </h2>
        <span className="text-bt-text-s tabular-nums text-muted">
          최근 {incidents.length}건
        </span>
      </div>

      {incidents.length === 0 ? (
        <p className="px-4 py-6 text-center text-b2_body_r text-muted">
          최근 장애가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-l-2 px-4 py-2"
              style={
                { borderLeftColor: KIND_TONE[incident.kind] } as CSSProperties
              }
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={KIND_CLASS[incident.kind]}>
                  <span className="status-dot" />
                  {KIND_LABEL[incident.kind]}
                </span>
                <span className="truncate text-b2_body_r font-medium text-main">
                  {incident.serverName}
                </span>
                <span className="truncate font-mono text-bt-text-s text-muted">
                  {incident.ipAddress}
                </span>
                <span className="truncate text-bt-text-s text-secondary">
                  {incident.detail}
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-bt-text-s tabular-nums text-muted">
                <span>{formatDuration(incident.durationMinutes)}</span>
                <span>{formatClock(incident.startedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
