// 파일을 받아 저장합니다.
//
// ★ client.ts 와 나란히 둡니다.
//   client.ts 는 JSON 만 다룹니다. 파일은 응답 모양이 전혀 달라
//   한 곳에 섞으면 둘 다 지저분해집니다.
//
// ★ 내려받기 세 곳이 모두 여기를 씁니다.
//   로그 내려받기 · 서버 목록 내려받기 · 일괄등록 양식.
//   한 곳에 두지 않으면 "파일 이름만 다른 같은 코드" 가 세 벌 생깁니다.

/**
 * 주소에서 파일을 받아 내려받기를 시작합니다.
 * 문제가 없으면 빈 문자열을, 아니면 사람에게 보여 줄 문구를 돌려줍니다.
 *
 * ★ 평범한 링크(<a href download>)를 쓰지 않는 이유
 *   그러면 실패해도 파일이 받아집니다. 세션이 끊겨 401 이 와도
 *   **오류 내용이 담긴 파일**이 .csv 라는 이름으로 저장되고,
 *   사람은 엑셀에서 그것을 열어 보고서야 이상하다는 것을 압니다.
 *   여기서 받아 보고, 잘렸으면 알려 주고, 실패하면 문구를 돌려줍니다.
 *
 * @param whenTruncated 서버가 "다 담지 못했다" 고 알려 줬을 때 보여 줄 문구
 */
export async function downloadFile(
  path: string,
  whenTruncated = "",
): Promise<string> {
  try {
    // 사람이 버튼을 눌러 생긴 요청이라 X-Background 를 달지 않습니다.
    // 달면 세션 기한이 밀리지 않아, 파일만 받다가 갑자기 로그아웃됩니다.
    const res = await fetch(`/api${path}`, { credentials: "include" });

    if (!res.ok) return "내려받지 못했습니다. 잠시 후 다시 시도해주세요.";

    const blob = await res.blob();

    // 서버가 정한 파일 이름을 그대로 씁니다.
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const matched = /filename="([^"]+)"/.exec(disposition);

    // 받은 내용을 주소로 만들어 눌러 줍니다.
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = matched?.[1] ?? "pingcheck.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // 안 풀어 주면 받은 내용이 메모리에 그대로 남습니다.
    URL.revokeObjectURL(url);

    return res.headers.get("X-Export-Truncated") === "1" ? whenTruncated : "";
  } catch {
    return "서버에 연결하지 못했습니다.";
  }
}
