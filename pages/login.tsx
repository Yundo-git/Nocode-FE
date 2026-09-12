import Head from "next/head";
import { useEffect, useState, type FormEvent } from "react";
import { ColorMode } from "@/components/ui/ColorMode";
import { LockIcon, UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";

// "아이디 저장"에 체크했을 때 아이디를 담아 두는 자리입니다.
const SAVED_ID_KEY = "nocode-saved-id";

// 배경의 사선 띠입니다.
// 세로로 긴 막대를 45도 돌려서 오른쪽 위 -> 왼쪽 아래로 흐르게 만들었습니다.
// 화면을 벗어나는 부분은 바깥 요소의 overflow-hidden 이 잘라 냅니다.
//
// 주의: 색은 primary-400 ~ 600 만 씁니다.
// primary-100/200/300 은 블랙 모드에서 값이 바뀌지 않아 흰색에 가깝게 남고,
// 그 위에 글자가 겹치면 글자가 보이지 않습니다.
function BackgroundBands() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 왼쪽 위: 진한 띠와, 그 옆에 흐르는 옅은 띠 */}
      <div className="absolute left-[8%] top-[-60%] h-[170%] w-[5rem] rotate-45 bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400" />
      <div className="absolute left-[15%] top-[-52%] h-[170%] w-[7rem] rotate-45 bg-gradient-to-b from-primary-400 to-transparent opacity-30" />

      {/* 오른쪽 아래: 같은 모양을 반대편에 놓습니다. */}
      <div className="absolute bottom-[-60%] right-[8%] h-[170%] w-[6rem] rotate-45 bg-gradient-to-t from-primary-500 via-primary-400 to-transparent opacity-80" />
      <div className="absolute bottom-[-52%] right-[16%] h-[170%] w-[8rem] rotate-45 bg-gradient-to-t from-primary-400 to-transparent opacity-25" />
    </div>
  );
}

// 로그인 화면입니다. 사이드바 없이 화면 전체를 씁니다.
export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // 비밀번호는 기본적으로 가려 두고, 필요할 때만 잠깐 볼 수 있게 합니다.
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 서버에서 그린 화면과 첫 화면이 같아야 하므로
  // 저장된 아이디는 화면이 뜬 뒤에 읽어 옵니다.
  useEffect(() => {
    const saved = window.localStorage.getItem(SAVED_ID_KEY);

    if (saved) {
      setUsername(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);

      if (remember) {
        window.localStorage.setItem(SAVED_ID_KEY, username.trim());
      } else {
        window.localStorage.removeItem(SAVED_ID_KEY);
      }
      // 성공하면 AuthGate 가 첫 화면으로 보내 줍니다.
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "로그인에 실패했습니다.",
      );
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>로그인 | PingCheck</title>
      </Head>

      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-panel">
        <BackgroundBands />

        {/* 가운데 입력 영역. relative 를 줘야 배경 띠 위에 올라옵니다. */}
        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-[340px]">
            {/* 서비스 이름. 두 색 모두 모드에 따라 바뀌는 값입니다. */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-h4 font-exbold tracking-tight text-body">
                PING
              </span>
              <span className="text-h4 font-exbold tracking-tight text-primary-500">
                CHECK
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              {/* 아이디: 테두리 없이 아래 선만 있는 입력칸입니다. */}
              <div className="flex items-center gap-2.5 border-b border-primary-400 py-2 transition focus-within:border-primary-600">
                <UserIcon
                  width={18}
                  height={18}
                  className="shrink-0 text-primary-500"
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  aria-label="아이디"
                  placeholder="ID"
                  className="min-w-0 flex-1 bg-transparent text-b2_body_r text-body outline-none placeholder:text-muted"
                />
              </div>

              {/* 비밀번호: 평소에는 점으로 가려지고, 오른쪽 버튼으로 잠깐 볼 수 있습니다. */}
              <div className="mt-4 flex items-center gap-2.5 border-b border-primary-400 py-2 transition focus-within:border-primary-600">
                <LockIcon
                  width={18}
                  height={18}
                  className="shrink-0 text-primary-500"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  aria-label="비밀번호"
                  placeholder="PASSWORD"
                  className="min-w-0 flex-1 bg-transparent text-b2_body_r text-body outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="shrink-0 text-bt-text-s font-semibold text-muted transition hover:text-body"
                >
                  {showPassword ? "숨기기" : "보기"}
                </button>
              </div>

              {/* 화면 모드 선택. 사이드바가 없는 화면이라 여기에 둡니다. */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <ColorMode />
              </div>

              {error ? (
                <p className="mt-4 text-bt-text-m font-medium text-down-500">
                  {error}
                </p>
              ) : null}

              <div className="mt-5 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-b2_body_r text-secondary">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(event.currentTarget.checked)
                    }
                    className="h-4 w-4 accent-primary-600"
                  />
                  아이디 저장
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm min-w-[88px] tracking-wide"
                >
                  {submitting ? "로그인 중..." : "LOGIN"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 화면 맨 아래 만든 사람 표기입니다. */}
        <div className="relative px-4 pb-6 text-center">
          <p className="text-d-label font-exbold uppercase tracking-widest text-primary-500">
            PingCheck
          </p>
          <p className="mt-1 text-d-label uppercase text-muted">
            Copyright © 2026 ydh. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
