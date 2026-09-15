
function decode(buffer: ArrayBuffer, label: string, fatal: boolean): string | null {
  try {
    return new TextDecoder(label, { fatal }).decode(buffer);
  } catch {
    return null;
  }
}

export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  return (
    decode(buffer, "utf-8", true) ??
    decode(buffer, "euc-kr", false) ??
    decode(buffer, "utf-8", false) ??
    ""
  );
}
