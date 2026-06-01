import { ColorMode } from "../ui/ColorMode";
import Link from "next/link";
import SupportMenu from "./SupportMenu";

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const Header = ({ theme, setTheme }: HeaderProps) => {
  return (
    <header className="px-8 py-4">
      <div className="flex items-center justify-between gap-12">
        {/* 로고 */}
        <div className="text-main font-bold text-h5">
          <Link href="/">Logo</Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex flex-1 items-center gap-16">
          <Link
            href="/products"
            className="relative text-main text-s1 font-semibold transition-colors duration-300 hover:text-point-500
           after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-point-500 
           after:transition-all after:duration-300 hover:after:w-full"
          >
            주요기능
          </Link>
          <Link
            href="/examples"
            className="relative text-main text-s1 font-semibold transition-colors duration-300 hover:text-point-500
           after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-point-500 
           after:transition-all after:duration-300 hover:after:w-full"
          >
            예시
          </Link>
          <Link
            href="/pricing"
            className="relative text-main text-s1 font-semibold transition-colors duration-300 hover:text-point-500
           after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-point-500 
           after:transition-all after:duration-300 hover:after:w-full"
          >
            요금
          </Link>

          {/* 고객지원 셀렉트 박스 */}
          <SupportMenu />
        </nav>

        {/* 우측 메뉴 (다크모드 및 회원 기능) */}
        <div className="flex items-center gap-2">
          {/* 다크모드 전환 */}
          <ColorMode theme={theme} setTheme={setTheme} />

          {/* 로그인 */}
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium w-32 text-center"
          >
            로그인
          </Link>

          {/* 시작하기 버튼 */}
          <Link
            href="/signup"
            className="  font-semibold text-main text-bt-text-large w-32 text-center"
          >
            시작하기
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
