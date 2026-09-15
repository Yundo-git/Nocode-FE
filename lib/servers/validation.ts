const MAX_NAME_LENGTH = 50;

function isValidIpv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return false;

    return Number(part) <= 255;
  });
}

function getUnusableIpReason(ip: string): string {
  const [first, second, , last] = ip.split(".").map(Number);

  if (first === 0) {
    return "0으로 시작하는 주소는 등록할 수 없습니다.";
  }

  if (first === 127) {
    return "127로 시작하는 주소는 자기 자신(루프백)이라 등록할 수 없습니다.";
  }

  if (first === 169 && second === 254) {
    return "169.254로 시작하는 주소는 임시 주소(링크 로컬)라 등록할 수 없습니다.";
  }

  if (first >= 224 && first <= 239) {
    return "224~239로 시작하는 주소는 그룹 주소(멀티캐스트)라 등록할 수 없습니다.";
  }

  if (first >= 240) {
    return "240 이상으로 시작하는 주소는 예약된 대역이라 등록할 수 없습니다.";
  }

  if (last === 0) {
    return "네트워크 주소(끝자리 0)는 등록할 수 없습니다. 서버의 실제 IP를 입력해주세요.";
  }

  if (last === 255) {
    return "브로드캐스트 주소(끝자리 255)는 등록할 수 없습니다. 서버의 실제 IP를 입력해주세요.";
  }

  return "";
}

function isValidServerNameEn(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(value);
}

export function validateNewServerInput(input: {
  ip: string;
  type: string;
  divisionId: string;
  nameEn: string;
  nameKo: string;
}): string {
  if (!input.ip.trim()) return "IP를 입력해주세요.";
  if (!isValidIpv4(input.ip.trim())) {
    return "IP 형식이 올바르지 않습니다. (예: 1.1.1.1)";
  }

  const unusable = getUnusableIpReason(input.ip.trim());
  if (unusable) return unusable;
  if (!input.type) return "타입을 선택해주세요.";
  if (!input.divisionId) return "업무구분을 선택해주세요.";
  if (!input.nameEn.trim()) return "영문명을 입력해주세요.";
  if (!isValidServerNameEn(input.nameEn.trim())) {
    return "영문명은 영문·숫자와 . _ - 만 쓸 수 있습니다.";
  }
  if (input.nameEn.trim().length > MAX_NAME_LENGTH) {
    return `영문명은 ${MAX_NAME_LENGTH}자까지 쓸 수 있습니다.`;
  }
  if (!input.nameKo.trim()) return "한글명을 입력해주세요.";
  if (input.nameKo.trim().length > MAX_NAME_LENGTH) {
    return `한글명은 ${MAX_NAME_LENGTH}자까지 쓸 수 있습니다.`;
  }

  return "";
}
