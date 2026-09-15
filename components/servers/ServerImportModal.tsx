import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { readCsvFile } from "@/lib/csv";
import type { ImportOutcome } from "@/lib/servers/useServers";
import type { ImportResult } from "@/lib/servers/types";

type ServerImportModalProps = {
  open: boolean;
  onClose: () => void;
  onDownloadTemplate: () => Promise<string>;
  onSubmit: (text: string) => Promise<ImportOutcome>;
  onDone: () => void;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function checkFile(file: File): string {
  if (/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
    return "엑셀 파일(.xlsx)은 그대로 올릴 수 없습니다. 엑셀에서 [다른 이름으로 저장] → CSV 를 고르세요.";
  }

  if (file.size === 0) return "빈 파일입니다.";

  if (file.size > MAX_FILE_BYTES) {
    return "파일이 너무 큽니다. (10MB까지) 줄을 나눠 여러 번에 걸쳐 올려 주세요.";
  }

  return "";
}

export function ServerImportModal({
  open,
  onClose,
  onDownloadTemplate,
  onSubmit,
  onDone,
}: ServerImportModalProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    if (open) return;

    setFile(null);
    setError("");
    setResult(null);
    if (fileRef.current !== null) fileRef.current.value = "";
  }, [open]);

  const handleTemplate = async () => {
    setError(await onDownloadTemplate());
  };

  const handleSubmit = async () => {
    if (file === null) return;

    setBusy(true);
    setError("");

    try {
      const outcome = await onSubmit(await readCsvFile(file));

      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }

      setResult(outcome.result);

      if (outcome.result.added > 0) onDone();
    } catch {
      setError("파일을 읽지 못했습니다. 다른 파일로 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="서버 일괄등록" onClose={onClose} closeOnBackdrop={false}>
      <div className="px-4 py-4">
        <ol className="space-y-3">
          <li className="flex items-center justify-between gap-3">
            <span className="text-b2_body_r text-secondary">
              <b className="font-semibold text-body">① 양식 받기</b> · 열 이름이 채워져
              있습니다
            </span>
            <button
              type="button"
              onClick={() => void handleTemplate()}
              className="btn btn-ghost btn-sm shrink-0"
            >
              양식 내려받기
            </button>
          </li>

          <li className="text-b2_body_r text-secondary">
            <b className="font-semibold text-body">② 채우기</b> · 엑셀에서 열고 장비를
            적은 뒤 <b className="font-semibold text-body">CSV</b> 로 저장합니다.
            한 번에 3,000대까지입니다.
          </li>

          <li className="space-y-2">
            <span className="text-b2_body_r text-secondary">
              <b className="font-semibold text-body">③ 올리기</b>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              aria-label="올릴 파일"
              onChange={(event) => {
                const picked = event.currentTarget.files?.[0] ?? null;
                const problem = picked === null ? "" : checkFile(picked);

                setFile(problem === "" ? picked : null);
                setError(problem);
                setResult(null);
              }}
              className="block w-full text-b2_body_r text-secondary file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-bt-text-m file:font-semibold file:text-body hover:file:bg-row-hover"
            />
          </li>
        </ol>

        {error ? (
          <p className="mt-3 text-bt-text-m font-medium text-down-500">{error}</p>
        ) : null}

        {result === null ? null : <ImportReport result={result} />}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-md">
            닫기
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={file === null || busy}
            className="btn btn-primary btn-md"
          >
            {busy ? "등록 중…" : "등록"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const SHOWN_FAILURES = 100;

function ImportReport({ result }: { result: ImportResult }) {
  const shown = result.failed.slice(0, SHOWN_FAILURES);
  const hidden = result.failed.length - shown.length;

  return (
    <div className="mt-4 rounded-md border border-line">
      <p className="border-b border-line px-3 py-2 text-b2_body_m font-medium text-body">
        {result.added}대 등록
        {result.failed.length > 0 ? ` · ${result.failed.length}줄 건너뜀` : ""}
      </p>

      {result.failed.length === 0 ? (
        <p className="px-3 py-2 text-b2_body_r text-muted">모두 등록했습니다.</p>
      ) : (
        <ul className="max-h-48 overflow-y-auto px-3 py-2">
          {shown.map((row) => (
            <li key={row.line} className="py-0.5 text-b2_body_r text-secondary">
              <span className="font-mono text-muted">{row.line}줄</span> {row.message}
            </li>
          ))}

          {hidden > 0 ? (
            <li className="py-1 text-b2_body_r text-muted">
              …그 밖에 {hidden}줄이 더 있습니다. 위 줄들을 고쳐 다시 올려 주세요.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
