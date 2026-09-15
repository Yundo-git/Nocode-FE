import { ACCOUNT_ROLES, type AccountRole, type MyProfileInput } from "@/lib/accounts/types";
import { BUSINESS_DIVISIONS } from "@/lib/businessDivisions";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^(\d{3,4}|\d{2,3}-\d{3,4}-\d{4})$/.test(value);
}

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

export function validateNewPassword(password: string): string {
  if (!password) return "새 비밀번호를 입력해주세요.";
  if (password.length < 6) return "비밀번호는 6자 이상이어야 합니다.";
  if (!/[0-9]/.test(password)) return "숫자를 1자 이상 넣어주세요.";
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return "특수문자를 1자 이상 넣어주세요. (예: ! @ # $)";
  }

  return "";
}

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

function isValidLoginId(value: string): boolean {
  return /^[A-Za-z0-9._-]{3,32}$/.test(value);
}

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

  return validateMyProfile({
    name: input.name,
    email: input.email,
    phone: input.phone,
  });
}
