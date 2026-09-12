// 데이터를 불러오는 중이거나 오류가 났을 때 자리를 채워 주는 영역입니다.
export function PanelMessage({ message }: { message: string }) {
  return (
    <div className="panel px-4 py-10 text-center">
      <p className="text-b2_body_r text-muted">{message}</p>
    </div>
  );
}
