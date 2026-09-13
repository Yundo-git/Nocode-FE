import { ACCOUNT_ROLES, type AccountRole, type MyProfileInput } from "@/lib/accounts/types";
import { BUSINESS_DIVISIONS } from "@/lib/businessDivisions";

// 아주 엄격한 검사는 아닙니다. 오타를 걸러 내는 정도입니다.
// (실제 확인은 메일 발송이나 백엔드가 합니다)
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * 전화번호입니다. 두 가지를 받습니다.
 *
 *   010-1234-5678 / 02-123-4567   바깥으로 거는 번호
 *   1234 / 123                     사내 내선번호
 *
 * ★ 내선번호를 따로 받는 이유
 *   사무실 자리에는 내선만 있는 경우가 흔합니다.
 *   그때 형식을 맞추려고 없는 국번을 지어내 적게 되고,
 *   그러면 장애가 났을 때 연락이 닿지 않습니다.
 *
 * 아주 엄격한 검사는 아닙니다. 오타를 걸러 내는 정도입니다.
 */
function isValidPhone(value: string): boolean {
  return /^(\d{3,4}|\d{2,3}-\d{3,4}-\d{4})$/.test(value);
}

// 내 정보 수정 검사입니다. 문제가 없으면 빈 문자열을 돌려줍니다.
function validateMyProfile(input: MyProfileInput): string {
  if (!input.name.trim()) return "이름을 입력해주세요.";
  if (!input.email.trim()) return "이메일을 입력해주세요.";
  if (!isValidEmail(input.email.trim())) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  if (!input.phone.trim()) return "번호를 입력해주세요.";
  if (!isValidPhone(input.phone.trim())) {
    return "번호는 010-1234-5678 또는 내선번호(1234) 형식으로 입력해주세요.";
  }

  return "";
}

/**
 * 새 비밀번호 규칙입니다.
 *
 * 숫자 1자 이상, 특수문자 1자 이상, 전체 6자 이상.
 *
 * ★ 길이보다 종류를 요구하는 이유
 *   6자는 짧습니다. 그래서 "abcdef" 같은 것이 못 들어오도록 종류를 섞게 합니다.
 *   종류가 섞이면 무차별 대입으로 찾아야 할 경우의 수가 크게 늘어납니다.
 *
 * ★ 여기서 막아도 마지막 방어는 scrypt 입니다.
 *   느리게 만들어진 해시라, 짧은 비밀번호라도 한 번에 수십만 개씩
 *   시험해 보는 것을 어렵게 만듭니다.
 *
 * ★★ 화면과 백엔드가 **같은 규칙**이어야 합니다. 한쪽만 고치지 마세요.
 */
export function validateNewPassword(password: string): string {
  if (!password) return "새 비밀번호를 입력해주세요.";
  if (password.length < 6) return "비밀번호는 6자 이상이어야 합니다.";
  if (!/[0-9]/.test(password)) return "숫자를 1자 이상 넣어주세요.";
  // 영문·숫자·공백이 아닌 글자를 특수문자로 봅니다.
  // 목록을 정해 두면 W 나 가운뎃점 같은 것을 빠뜨리게 됩니다.
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return "특수문자를 1자 이상 넣어주세요. (예: ! @ # $)";
  }

  return "";
}

// 비밀번호 변경 검사입니다.
export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): string {
  if (!currentPassword) return "현재 비밀번호를 입력해주세요.";
  if (!newPassword) return "새 비밀번호를 입력해주세요.";
  if (newPassword.length < 8) return "새 비밀번호는 8자 이상이어야 합니다.";
  if (newPassword === currentPassword) {
    return "현재 비밀번호와 다른 값을 입력해주세요.";
  }
  if (newPassword !== confirmPassword) {
    return "새 비밀번호가 서로 다릅니다.";
  }

  return "";
}

// 로그인 아이디입니다. 주소나 파일 이름에 들어갈 수 있어 기호를 제한합니다.
function isValidLoginId(value: string): boolean {
  return /^[A-Za-z0-9._-]{3,32}$/.test(value);
}

// 관리자가 넣은 값을 검사합니다. 문제가 없으면 빈 문자열입니다.
export function validateAdminAccount(input: {
  loginId: string;
  name: string;
  email: string;
  phone: string;
  divisionId: string;
  role: string;
}): string {
  if (!input.loginId.trim()) return "아이디를 입력해주세요.";
  if (!isValidLoginId(input.loginId.trim())) {
    return "아이디는 영문·숫자와 . _ - 로 3~32자여야 합니다.";
  }
  if (!input.divisionId) return "업무파트를 선택해주세요.";
  if (!BUSINESS_DIVISIONS.some((d) => d.id === input.divisionId)) {
    return "업무파트를 선택해주세요.";
  }
  if (!input.role) return "권한을 선택해주세요.";
  if (!ACCOUNT_ROLES.includes(input.role as AccountRole)) {
    return "권한을 선택해주세요.";
  }

  // 이름·이메일·번호 규칙은 본인 수정과 같습니다.
  return validateMyProfile({
    name: input.name,
    email: input.email,
    phone: input.phone,
  });
}
