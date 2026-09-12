// 화면에 값을 표시할 때 쓰는 순수 함수 모음입니다.
// 서버와 브라우저에서 항상 같은 결과가 나와야 하므로
// 현재 시각이나 지역 설정(locale, timezone)에 의존하지 않습니다.

// 1000 단위로 쉼표를 넣습니다. (예: 1000 -> "1,000")
export function formatCount(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ISO 문자열에서 시:분:초만 잘라서 보여줍니다. (예: "09:12:41")
export function formatClock(isoString: string): string {
  return isoString.slice(11, 19);
}

// 응답 시간을 표시합니다. 응답이 없으면 "-" 로 표시합니다.
export function formatLatency(latencyMs: number | null): string {
  if (latencyMs === null) {
    return "-";
  }

  return `${latencyMs} ms`;
}

// 가동률을 소수점 둘째 자리까지 표시합니다.
export function formatUptime(uptimePercent: number): string {
  return `${uptimePercent.toFixed(2)}%`;
}

// 장애 지속 시간을 사람이 읽기 좋은 형태로 바꿉니다.
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (restMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${restMinutes}분`;
}
