// 0~255 네 덩어리인지 봅니다.
//
// 앞자리 0 도 막습니다. "01.1.1.1" 과 "1.1.1.1" 은 같은 서버를 가리키는데
// 글자로는 달라서, 허용하면 같은 서버를 두 번 등록할 수 있습니다.
// (중복 IP 검사는 글자를 그대로 비교합니다)
function isValidIpv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    // 한 자리면 0~9, 두 자리 이상이면 첫 글자가 0 이면 안 됩니다.
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return false;

    return Number(part) <= 255;
  });
}

// 형식은 맞지만 서버 한 대를 가리키지 않는 주소입니다.
// 문제가 없으면 빈 문자열을, 아니면 막는 이유를 돌려줍니다.
//
// isValidIpv4 를 통과한 값이 들어온다고 보고 숫자로 바꿉니다.
//
// 끝자리 0 / 255 는 "/24 대역" 을 전제로 막습니다.
// 그보다 넓은 대역(예: 10.0.0.0/16)에서는 10.0.1.0 이나 10.0.1.255 도
// 정상적인 서버 주소입니다. 그런 망을 감시하게 되면 아래 두 줄을 풀어야 합니다.
function getUnusableIpReason(ip: string): string {
  const [first, second, , last] = ip.split(".").map(Number);

  // 0.0.0.0/8 — 목적지로 쓸 수 없는 대역입니다.
  if (first === 0) {
    return "0으로 시작하는 주소는 등록할 수 없습니다.";
  }

  // 127.0.0.0/8 — 전부 자기 자신을 가리킵니다.
  if (first === 127) {
    return "127로 시작하는 주소는 자기 자신(루프백)이라 등록할 수 없습니다.";
  }

  // 169.254.0.0/16 — DHCP 를 못 받았을 때 붙는 임시 주소입니다.
  if (first === 169 && second === 254) {
    return "169.254로 시작하는 주소는 임시 주소(링크 로컬)라 등록할 수 없습니다.";
  }

  // 224.0.0.0/4 — 한 대가 아니라 여러 대를 묶어 가리키는 주소입니다.
  if (first >= 224 && first <= 239) {
    return "224~239로 시작하는 주소는 그룹 주소(멀티캐스트)라 등록할 수 없습니다.";
  }

  // 240.0.0.0/4 — 예약된 대역입니다. 255.255.255.255(브로드캐스트)도 여기 듭니다.
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

// 등록 폼 검사입니다. 문제가 없으면 빈 문자열을 돌려줍니다.
// 화면과 API 가 같은 규칙을 쓰도록 여기에 모아 둡니다.
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
  if (!input.nameKo.trim()) return "한글명을 입력해주세요.";

  return "";
}
