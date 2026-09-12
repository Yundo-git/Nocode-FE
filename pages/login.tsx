import Head from "next/head";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

// 로그인 화면입니다. 사이드바 없이 입력칸만 화면 가운데에 놓습니다.
export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // 비밀번호는 기본적으로 가려 두고, 필요할 때만 잠깐 볼 수 있게 합니다.
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
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
        <title>로그인</title>
      </Head>

      <div className="bg-theme flex min-h-[100dvh] items-center justify-center px-4 py-10">
        <div className="panel w-full max-w-[380px] p-7">
          <h1 className="text-h5 font-semibold text-body">로그인</h1>
          <p className="mt-1 text-b2_body_r text-muted">
            계속하려면 로그인해 주세요.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="text-b2_body_m font-medium text-secondary"
              >
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                className="input mt-1.5 w-full"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-b2_body_m font-medium text-secondary"
              >
                비밀번호
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  // 평소에는 password 라서 입력한 글자가 점으로 가려집니다.
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  className="input w-full pr-16"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  className="absolute inset-y-0 right-0 px-3 text-bt-text-s font-semibold text-muted transition hover:text-body"
                >
                  {showPassword ? "숨기기" : "보기"}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-bt-text-m font-medium text-down-500">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-md w-full"
            >
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
