"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown, HelpCircle, MessageSquareText } from "lucide-react";
import Link from "next/link";

export default function SupportMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* 메뉴 버튼 */}
      <MenuButton
        className="relative flex items-center gap-1 text-main text-s1 font-semibold transition-colors duration-300 hover:text-point-500 
                   after:absolute after:left-0 after:bottom-[-20px] after:h-[2px] after:w-0 after:bg-point-500 
                   after:transition-all after:duration-300 hover:after:w-full data-[open]:after:w-full data-[open]:text-point-500"
      >
        고객지원
        <ChevronDown className="w-4 h-4" />
      </MenuButton>

      {/* 드롭다운 메뉴 영역 */}
      <MenuItems
        transition
        className="absolute right-0 z-10 mt-3 w-72 origin-top-right rounded-2xl bg-white p-2 shadow-xl border border-gray-100 focus:outline-none 
                   transform-gpu transition duration-200 ease-out 
                   data-[closed]:scale-95 data-[closed]:opacity-0 
                   data-[enter]:duration-200 data-[leave]:duration-150"
      >
        {/* 메뉴 아이템 1: 자주 묻는 질문 */}
        <MenuItem>
          <Link
            href="/faq"
            className="flex items-start gap-4 rounded-xl p-3 data-[focus]:bg-gray-50 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">자주 묻는 질문</p>
              <p className="text-sm text-gray-500">
                궁금한 점을 먼저 확인해보세요.
              </p>
            </div>
          </Link>
        </MenuItem>

        {/* 메뉴 아이템 2: 고객센터 */}
        <MenuItem>
          <Link
            href="/support"
            className="flex items-start gap-4 rounded-xl p-3 data-[focus]:bg-gray-50 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">고객센터</p>
              <p className="text-sm text-gray-500">1:1 문의를 남겨주세요.</p>
            </div>
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
