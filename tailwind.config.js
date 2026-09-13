/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "var(--primary-900)",
          800: "var(--primary-800)",
          700: "var(--primary-700)",
          600: "var(--primary-600)",
          500: "var(--primary-500)",
          400: "var(--primary-400)",
          300: "var(--primary-300)",
          200: "var(--primary-200)",
          100: "var(--primary-100)",
          50: "var(--primary-50)",
        },
        // 패널과 구분선 색상입니다.
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        "row-hover": "var(--row-hover)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        // 상태 점 색상입니다. (정상 / 비정상 / 확인 중 / 미연결)
        up: { 500: "var(--up-500)" },
        down: { 500: "var(--down-500)" },
        pending: { 500: "var(--pending-500)" },
        unknown: { 500: "var(--unknown-500)" },
        body: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        white: "var(--text-white)",
      },
      boxShadow: {
        soft: "0 25px 80px rgba(76, 29, 149, 0.25)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        // IP, 응답 시간처럼 자릿수를 맞춰 봐야 하는 값에 사용합니다.
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        h3: ["32px", { lineHeight: "38px" }],
        h4: ["28px", { lineHeight: "34px" }],
        h5: ["24px", { lineHeight: "28px" }],
        s1: ["18px", { lineHeight: "28px" }],
        s2: ["16px", { lineHeight: "24px" }],
        b2_body_r: ["14px", { lineHeight: "20px" }],
        b2_body_m: ["14px", { lineHeight: "20px" }],
        "bt-text-large": ["16px", { lineHeight: "20px" }],
        "bt-text-m": ["14px", { lineHeight: "16px" }],
        "bt-text-s": ["12px", { lineHeight: "16px" }],
        // 작은 라벨에 사용합니다.
        "d-label": ["11px", { lineHeight: "14px", letterSpacing: "0.04em" }],
      },
      fontWeight: {
        medium: "500",
        semibold: "600",
        bold: "700",
        exbold: "800",
      },
    },
  },
  plugins: [],
};

/*
  Tailwind에서 커스텀 컬러와 텍스트 스타일 사용하는 예시:

  색상:
    bg-primary-500 / text-primary-600 / border-primary-300
    bg-panel / bg-panel-2 / border-line / border-line-strong
    text-body / text-secondary / text-muted / text-white
    bg-up-500 (정상) / bg-down-500 (비정상) / bg-unknown-500 (미연결)

  글자 크기:
    text-h4 (28px) / text-h5 (24px) / text-s1 (18px) / text-s2 (16px)
    text-b2_body_r, text-b2_body_m (14px)
    text-bt-text-large (16px) / text-bt-text-m (14px) / text-bt-text-s (12px)
    text-d-label (11px, 작은 라벨)

  굵기: font-medium / font-semibold / font-bold / font-exbold

  예시)
    <h1 className="text-h5 font-semibold text-body">제목</h1>
    <p className="text-b2_body_r text-muted">본문</p>
*/
