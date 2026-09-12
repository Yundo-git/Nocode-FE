import type { MyProfileInput } from "@/lib/accounts/types";

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
