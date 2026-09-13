import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { readCsvFile } from "@/lib/csv";
import type { ImportOutcome } from "@/lib/servers/useServers";
import type { ImportResult } from "@/lib/servers/types";

type ServerImportModalProps = {
  open: boolean;
  onClose: () => void;
  /** 양식을 내려받습니다. 문제가 있으면 문구를 돌려줍니다. */
  onDownloadTemplate: () => Promise<string>;
  onSubmit: (text: string) => Promise<ImportOutcome>;
  /** 등록이 끝나면 목록을 다시 받습니다. */
  onDone: () => void;
};

/**
 * 올리기 전에 브라우저에서 먼저 걸러 냅니다. 문제가 없으면 빈 문자열입니다.
 *
 * ★ 서버도 같은 것을 다시 봅니다. 여기서 막는 것은 **낭비를 줄이려는** 것입니다.
 *   엑셀 원본은 몇 MB 씩 나갑니다. 어차피 되돌아올 파일을 굳이 보낼 이유가 없고,
 *   고를 때 바로 알려 주는 편이 올린 뒤에 듣는 것보다 빠릅니다.
 */
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

// 파일로 여러 대를 한 번에 등록하는 창입니다.
//
// ★ 순서를 화면에 그대로 적습니다. ① 양식 받기 → ② 채우기 → ③ 올리기
//   "CSV 로 올리세요" 라고만 하면 열 이름을 각자 지어 내고, 그 파일은
//   전부 실패로 돌아옵니다. 양식을 먼저 주는 것이 가장 확실한 안내입니다.
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
  // 파일 자체가 잘못됐을 때의 한 줄 문구입니다.
  const [error, setError] = useState("");
  // 서버가 돌려준 결과입니다. null 이면 아직 올리기 전입니다.
  const [result, setResult] = useState<ImportResult | null>(null);

  // 창을 닫았다 다시 열면 처음 상태여야 합니다.
  // 남겨 두면 지난번 결과가 이번 파일의 결과처럼 보입니다.
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
      // 파일을 글로 읽어 그대로 올립니다. (lib/api/client.ts 의 postCsv)
      const outcome = await onSubmit(await readCsvFile(file));

      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }

      setResult(outcome.result);

      // 한 대라도 들어갔으면 목록을 다시 받습니다.
      // 실패 목록은 창에 그대로 둡니다. 닫기 전에 읽어야 고칠 수 있습니다.
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

                // 걸러진 파일은 들고 있지 않습니다. 등록 버튼이 눌리면 안 됩니다.
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

/**
 * 실패한 줄을 몇 개까지 그릴지입니다.
 *
 * ★ 한 번에 3,000줄까지 올릴 수 있어, 업무구분 하나를 잘못 적으면
 *   **3,000줄이 전부 실패**로 돌아옵니다. 그걸 다 그리면 창이 굳습니다.
 *   같은 이유로 줄줄이 실패한 것을 3,000개까지 읽을 사람도 없습니다.
 *   앞쪽만 보여 주고 몇 줄이 더 있는지는 숫자로 알려 줍니다.
 */
const SHOWN_FAILURES = 100;

// 결과입니다. 안 된 줄은 **줄 번호와 이유**를 그대로 보여 줍니다.
// "N줄 실패" 라고만 하면 어느 줄을 고쳐야 하는지 알 수 없습니다.
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
        // 줄이 많을 수 있어 이 칸만 따로 스크롤합니다.
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
