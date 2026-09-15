
export async function downloadFile(
  path: string,
  whenTruncated = "",
): Promise<string> {
  try {
    const res = await fetch(`/api${path}`, { credentials: "include" });

    if (!res.ok) return "내려받지 못했습니다. 잠시 후 다시 시도해주세요.";

    const blob = await res.blob();

    const disposition = res.headers.get("Content-Disposition") ?? "";
    const matched = /filename="([^"]+)"/.exec(disposition);

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = matched?.[1] ?? "pingcheck.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return res.headers.get("X-Export-Truncated") === "1" ? whenTruncated : "";
  } catch {
    return "서버에 연결하지 못했습니다.";
  }
}
