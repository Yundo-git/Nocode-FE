import { ColorMode } from "./ui/ColorMode";

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const Header = ({ theme, setTheme }: HeaderProps) => {
  // tailwind로 스타일링 해야함
  return (
    <header
      style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>Logo</div>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <a href="#" style={{ color: "#111827", textDecoration: "none" }}>
            Product
          </a>
          <a href="#" style={{ color: "#111827", textDecoration: "none" }}>
            Example
          </a>
          <a href="#" style={{ color: "#111827", textDecoration: "none" }}>
            Pricing
          </a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ColorMode theme={theme} setTheme={setTheme} />
          <a href="#" style={{ color: "#4b5563", textDecoration: "none" }}>
            Login
          </a>
          <a
            href="#"
            style={{
              padding: "0.6rem 1.1rem",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "9999px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Start
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
