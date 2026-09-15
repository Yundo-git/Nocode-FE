module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ★ <alpha-value> 를 넣어야 text-muted/70 같은 투명도 표기가 CSS 로 만들어집니다.
      //   그냥 var(--x) 로 두면 Tailwind 가 투명도 변형을 아예 생성하지 않아,
      //   /70 을 붙인 글씨가 소리 없이 부모 색을 그대로 물려받습니다.
      colors: {
        primary: {
          900: "color-mix(in srgb, var(--primary-900) calc(<alpha-value> * 100%), transparent)",
          800: "color-mix(in srgb, var(--primary-800) calc(<alpha-value> * 100%), transparent)",
          700: "color-mix(in srgb, var(--primary-700) calc(<alpha-value> * 100%), transparent)",
          600: "color-mix(in srgb, var(--primary-600) calc(<alpha-value> * 100%), transparent)",
          500: "color-mix(in srgb, var(--primary-500) calc(<alpha-value> * 100%), transparent)",
          400: "color-mix(in srgb, var(--primary-400) calc(<alpha-value> * 100%), transparent)",
          300: "color-mix(in srgb, var(--primary-300) calc(<alpha-value> * 100%), transparent)",
          200: "color-mix(in srgb, var(--primary-200) calc(<alpha-value> * 100%), transparent)",
          100: "color-mix(in srgb, var(--primary-100) calc(<alpha-value> * 100%), transparent)",
          50: "color-mix(in srgb, var(--primary-50) calc(<alpha-value> * 100%), transparent)",
        },
        panel: "color-mix(in srgb, var(--panel) calc(<alpha-value> * 100%), transparent)",
        "panel-2": "color-mix(in srgb, var(--panel-2) calc(<alpha-value> * 100%), transparent)",
        "row-hover": "color-mix(in srgb, var(--row-hover) calc(<alpha-value> * 100%), transparent)",
        line: "color-mix(in srgb, var(--line) calc(<alpha-value> * 100%), transparent)",
        "line-strong": "color-mix(in srgb, var(--line-strong) calc(<alpha-value> * 100%), transparent)",
        up: { 500: "color-mix(in srgb, var(--up-500) calc(<alpha-value> * 100%), transparent)" },
        down: { 500: "color-mix(in srgb, var(--down-500) calc(<alpha-value> * 100%), transparent)" },
        pending: { 500: "color-mix(in srgb, var(--pending-500) calc(<alpha-value> * 100%), transparent)" },
        unknown: { 500: "color-mix(in srgb, var(--unknown-500) calc(<alpha-value> * 100%), transparent)" },
        body: "color-mix(in srgb, var(--text-primary) calc(<alpha-value> * 100%), transparent)",
        secondary: "color-mix(in srgb, var(--text-secondary) calc(<alpha-value> * 100%), transparent)",
        muted: "color-mix(in srgb, var(--text-muted) calc(<alpha-value> * 100%), transparent)",
        white: "color-mix(in srgb, var(--text-white) calc(<alpha-value> * 100%), transparent)",
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

