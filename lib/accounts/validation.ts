import { ACCOUNT_ROLES, type AccountRole, type AdminAccountInput, type MyProfileInput } from "@/lib/accounts/types";
import { BUSINESS_DIVISIONS, type BusinessDivisionId } from "@/lib/businessDivisions";

// 아주 엄격한 검사는 아닙니다. 오타를 걸러 내는 정도입니다.
// (실제 확인은 메일 발송이나 백엔드가 합니다)
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

// 010-1234-5678 / 02-123-4567 처럼 숫자와 하이픈만 받습니다.
export function isValidPhone(value: string): boolean {
  return /^\d{2,3}-\d{3,4}-\d{4}$/.test(value);
}

// 내 정보 수정 검사입니다. 문제가 없으면 빈 문자열을 돌려줍니다.
export function validateMyProfile(input: MyProfileInput): string {
  if (!input.name.trim()) return "이름을 입력해주세요.";
  if (!input.email.trim()) return "이메일을 입력해주세요.";
  if (!isValidEmail(input.email.trim())) {
    return "이메일 형식이 올바르지 않습니다.";
  }
  if (!input.phone.trim()) return "번호를 입력해주세요.";
  if (!isValidPhone(input.phone.trim())) {
    return "번호는 010-1234-5678 형식으로 입력해주세요.";
  }

  return "";
}

/**
 * 새 비밀번호 규칙입니다. 백엔드의 validateNewPassword 와 같아야 합니다.
 * (pingcheck-be/src/modules/accounts/account.validation.ts)
 */
export function validateNewPassword(password: string): string {
  if (!password) return "새 비밀번호를 입력해주세요.";
  if (password.length < 8) return "새 비밀번호는 8자 이상이어야 합니다.";

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
export function isValidLoginId(value: string): boolean {
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

// API 로 들어온 값의 모양을 확인하고 다듬습니다.
export function parseAdminAccount(body: unknown): AdminAccountInput | null {
  if (typeof body !== "object" || body === null) return null;

  const raw = body as Record<string, unknown>;
  const text = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string).trim() : "";

  const input = {
    loginId: text("loginId"),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    divisionId: text("divisionId"),
    role: text("role"),
  };

  if (validateAdminAccount(input)) return null;

  return {
    ...input,
    divisionId: input.divisionId as BusinessDivisionId,
    role: input.role as AccountRole,
  };
}
