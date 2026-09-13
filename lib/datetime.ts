// 날짜와 시각을 화면에 적는 함수들입니다.
//
// 여기 모으는 이유:
// - 같은 일을 하는 함수가 화면마다 조금씩 다르게 있었습니다.
//   (초를 넣은 곳, 뺀 곳, 날짜를 붙인 곳이 제각각이었습니다)
// - toLocaleString 은 브라우저의 언어 설정에 따라 모양이 달라져
//   사람마다 다르게 보입니다. 그래서 자릿수를 직접 맞춥니다.
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// 2026-09-13
export function formatDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 11:48:20
export function formatTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 2026-09-13 11:48:20
export function formatDateTime(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return `${formatDate(iso)} ${formatTime(iso)}`;
}

// 09-13 11:48  (좁은 자리에 씁니다)
export function formatShort(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 09-13 11:48:20  (초까지 필요한 좁은 자리)
export function formatShortWithSeconds(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "-";

  return `${formatShort(iso)}:${pad(date.getSeconds())}`;
}
