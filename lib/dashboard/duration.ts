export function formatElapsed(from: string, now: number): string {
  const start = new Date(from).getTime();

  if (Number.isNaN(start)) return "";

  const seconds = Math.max(0, Math.floor((now - start) / 1000));

  if (seconds < 60) return `${seconds}초째`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분째`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간째`;

  return `${Math.floor(hours / 24)}일째`;
}

export function formatAgo(from: string, now: number): string {
  const at = new Date(from).getTime();

  if (Number.isNaN(at)) return "";

  const seconds = Math.max(0, Math.floor((now - at) / 1000));

  if (seconds < 60) return `${seconds}초 전`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  return `${Math.floor(hours / 24)}일 전`;
}
