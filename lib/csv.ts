// 사람이 고른 CSV 파일을 글로 읽습니다.
//
// ★ 한국에서 엑셀로 저장한 CSV 는 UTF-8 이 아닐 때가 많습니다.
//   엑셀의 "CSV (쉼표로 분리)" 는 윈도우 한글 인코딩(CP949)으로 저장합니다.
//   그대로 UTF-8 로 읽으면 한글이 전부 깨져서, 업무구분·타입을 못 알아보고
//   **멀쩡히 채운 파일이 통째로 실패**로 돌아옵니다.
//
//   창에 "CSV UTF-8 로 저장하세요" 라고 적어 두긴 했지만, 안내만 믿을 수는 없습니다.
//   UTF-8 로 먼저 엄격하게 읽어 보고, 깨지면 CP949 로 다시 읽습니다.
//   (순서를 바꾸면 안 됩니다. CP949 는 아무 바이트나 받아들여 실패하지 않습니다)

/** 못 읽으면 null 입니다. (브라우저가 그 인코딩을 모를 수도 있습니다) */
function decode(buffer: ArrayBuffer, label: string, fatal: boolean): string | null {
  try {
    return new TextDecoder(label, { fatal }).decode(buffer);
  } catch {
    return null;
  }
}

export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  // fatal 을 켜야 깨진 바이트에서 예외가 납니다. 안 켜면 조용히 "" 가 됩니다.
  return (
    decode(buffer, "utf-8", true) ??
    decode(buffer, "euc-kr", false) ??
    decode(buffer, "utf-8", false) ??
    ""
  );
}
