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
        point: {
          900: "var(--point-900)",
          800: "var(--point-800)",
          700: "var(--point-700)",
          600: "var(--point-600)",
          500: "var(--point-500)",
          400: "var(--point-400)",
          300: "var(--point-300)",
          200: "var(--point-200)",
          100: "var(--point-100)",
          50: "var(--point-50)",
        },
        // 패널과 구분선 색상입니다.
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        "row-hover": "var(--row-hover)",
        "row-zebra": "var(--row-zebra)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        // 상태 색상입니다.
        up: { 500: "var(--up-500)", bg: "var(--up-bg)" },
        warn: { 500: "var(--warn-500)", bg: "var(--warn-bg)" },
        down: { 500: "var(--down-500)", bg: "var(--down-bg)" },
        unknown: { 500: "var(--unknown-500)", bg: "var(--unknown-bg)" },
        body: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        white: "var(--text-white)",
        main: "var(--text-primary)",
      },
      boxShadow: {
        soft: "0 25px 80px rgba(76, 29, 149, 0.25)",
      },
      borderRadius: {
        xl: "1.75rem",
        "2xl": "2rem",
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
        h1: ["48px", { lineHeight: "58px" }],
        h2: ["40px", { lineHeight: "48px" }],
        h3: ["32px", { lineHeight: "38px" }],
        h4: ["28px", { lineHeight: "34px" }],
        h5: ["24px", { lineHeight: "28px" }],
        s1: ["18px", { lineHeight: "28px" }],
        s2: ["16px", { lineHeight: "24px" }],
        b1_body_r: ["16px", { lineHeight: "24px" }],
        b1_body_m: ["16px", { lineHeight: "24px" }],
        b2_body_r: ["14px", { lineHeight: "20px" }],
        b2_body_m: ["14px", { lineHeight: "20px" }],
        "bt-text-giant": ["18px", { lineHeight: "24px" }],
        "bt-text-large": ["16px", { lineHeight: "20px" }],
        "bt-text-m": ["14px", { lineHeight: "16px" }],
        "bt-text-s": ["12px", { lineHeight: "16px" }],
        // 작은 라벨에 사용합니다.
        "d-label": ["11px", { lineHeight: "14px", letterSpacing: "0.04em" }],
      },
      fontWeight: {
        regular: "400",
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

  색상 사용 예시:
    bg-primary-500       -> 배경색 primary 500
    text-point-600       -> 텍스트 색상 point 600
    border-primary-900   -> 테두리 색상 primary 900
    text-secondary       -> 텍스트 색상 secondary
    text-muted           -> 텍스트 색상 muted
    bg-white             -> 흰색 배경

  커스텀 텍스트 스타일 사용 예시:
    text-h1              -> 48px / 58px
    text-h2              -> 40px / 48px
    text-h3              -> 32px / 38px
    text-h4              -> 28px / 34px
    text-h5              -> 24px / 28px
    text-s1              -> 18px / 28px
    text-s2              -> 16px / 24px
    text-b1_body_r       -> 16px / 24px, Regular
    text-b1_body_m       -> 16px / 24px, Medium
    text-b2_body_r       -> 14px / 20px, Regular
    text-b2_body_m       -> 14px / 20px, Medium
    text-bt-text-giant   -> 18px / 24px
    text-bt-text-large   -> 16px / 20px
    text-bt-text-m       -> 14px / 16px
    text-bt-text-s       -> 12px / 16px

  예시 JSX:
    <h1 className="text-h1 font-semibold text-primary-500">
      제목 텍스트
    </h1>

    <p className="text-b1_body_r text-muted">
      본문 텍스트
    </p>

    <button className="bg-point-500 text-white px-4 py-2 rounded">
      버튼
    </button>
*/
