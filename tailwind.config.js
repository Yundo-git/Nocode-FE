/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#312E81",
          800: "#3730A3",
          700: "#4338CA",
          600: "#4F46E5",
          500: "#6366F1",
          400: "#818CF8",
          300: "#A5B4FC",
          200: "#C7D2FE",
          100: "#E0E7FF",
          50: "#EEF2FF",
        },
        point: {
          900: "#895906",
          800: "#B07207",
          700: "#D78C09",
          600: "#F59E0B",
          500: "#F7B23B",
          400: "#F8C162",
          300: "#F9D18A",
          200: "#FBE0B1",
          100: "#FCE8C5",
          50: "#FDEFD8",
        },
        body: "#18181B",
        secondary: "#52525B",
        muted: "#A1A1AA",
        white: "#F1F1F1",
        main: "#F8FAFC",
      },
      boxShadow: {
        soft: "0 25px 80px rgba(49, 46, 129, 0.25)",
      },
      borderRadius: {
        xl: "1.75rem",
        "2xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "58px" }],
        h2: ["40px", { lineHeight: "48px" }],
        h3: ["32px", { lineHeight: "38px" }],
        h4: ["28px", { lineHeight: "34px" }],
        h5: ["24px", { lineHeight: "28px" }],
        s1: ["18px", { lineHeight: "28px" }],
        s2: ["16px", { lineHeight: "24px" }],
        "b1-body-r": ["16px", { lineHeight: "24px" }],
        "b1-body-m": ["16px", { lineHeight: "24px" }],
        "b2-body-r": ["14px", { lineHeight: "20px" }],
        "b2-body-m": ["14px", { lineHeight: "20px" }],
        "bt-text-giant": ["18px", { lineHeight: "24px" }],
        "bt-text-large": ["16px", { lineHeight: "20px" }],
        "bt-text-m": ["14px", { lineHeight: "16px" }],
        "bt-text-s": ["12px", { lineHeight: "16px" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
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
