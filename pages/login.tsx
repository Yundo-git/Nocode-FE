import Head from "next/head";
import { useEffect, useState, type FormEvent } from "react";
import { ColorMode } from "@/components/ui/ColorMode";
import { LockIcon, UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";
import { PasswordSetupModal } from "@/components/auth/PasswordSetupModal";
import { Signature } from "@/components/ui/Signature";

const SAVED_ID_KEY = "nocode-saved-id";

function BackgroundBands() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-[8%] top-[-60%] h-[170%] w-[5rem] rotate-45 bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400" />
      <div className="absolute left-[15%] top-[-52%] h-[170%] w-[7rem] rotate-45 bg-gradient-to-b from-primary-400 to-transparent opacity-30" />

      <div className="absolute bottom-[-60%] right-[8%] h-[170%] w-[6rem] rotate-45 bg-gradient-to-t from-primary-500 via-primary-400 to-transparent opacity-80" />
      <div className="absolute bottom-[-52%] right-[16%] h-[170%] w-[8rem] rotate-45 bg-gradient-to-t from-primary-400 to-transparent opacity-25" />
    </div>
  );
}

export default function LoginPage() {
  const { login, setupPassword } = useAuth();
  const [setupFor, setSetupFor] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const result = await login(username, password);

      if (result === "needs-setup") {
        setSetupFor(username.trim());
        setSubmitting(false);
        return;
      }

      if (remember) {
        window.localStorage.setItem(SAVED_ID_KEY, username.trim());
      } else {
        window.localStorage.removeItem(SAVED_ID_KEY);
      }
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

        <div className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-[340px]">
            <div className="flex items-center justify-center gap-1">
              <span className="text-h4 font-exbold tracking-tight text-body">
                PING
              </span>
              <span className="text-h4 font-exbold tracking-tight text-primary-500">
                CHECK
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
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

              <p className="mt-3 text-bt-text-s text-muted">
                처음 로그인하시나요? 비밀번호 없이 아이디만 넣고 눌러 주세요.
              </p>

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

        <div className="relative px-4 pb-6 text-center">
          <p className="text-d-label font-exbold uppercase tracking-widest text-primary-500">
            PingCheck
          </p>
          <Signature />
        </div>

        <PasswordSetupModal
          open={setupFor !== ""}
          loginId={setupFor}
          onClose={() => setSetupFor("")}
          onSubmit={async (newPassword) => {
            try {
              await setupPassword(setupFor, newPassword);

              if (remember) {
                window.localStorage.setItem(SAVED_ID_KEY, setupFor);
              }

              return "";
            } catch (caught) {
              return caught instanceof Error
                ? caught.message
                : "비밀번호를 설정하지 못했습니다.";
            }
          }}
        />
      </div>
    </>
  );
}
