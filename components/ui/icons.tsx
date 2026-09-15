import type { ReactNode, SVGProps } from "react";

function IconBase({
  children,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const plainStroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
} as const;

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 12H19M16 9L19 12L16 15" {...stroke} />
      <path
        d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
        {...stroke}
      />
    </IconBase>
  );
}

export function TabOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M2 18V6C2 4.34315 3.34315 3 5 3H7C8.65685 3 10 4.34315 10 6V18C10 19.6569 8.65685 21 7 21H5C3.34315 21 2 19.6569 2 18Z"
        {...plainStroke}
      />
      <path
        d="M16 3H18C20.2091 3 22 4.79086 22 7V17C22 19.2091 20.2091 21 18 21H16"
        {...stroke}
      />
      <path d="M10 12H18M15 15L18 12L15 9" {...stroke} />
    </IconBase>
  );
}

export function TabCloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M22 18V6C22 4.34315 20.6569 3 19 3H17C15.3431 3 14 4.34315 14 6V18C14 19.6569 15.3431 21 17 21H19C20.6569 21 22 19.6569 22 18Z"
        {...plainStroke}
      />
      <path
        d="M8 3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H8"
        {...stroke}
      />
      <path d="M14 12H6M9 15L6 12L9 9" {...stroke} />
    </IconBase>
  );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M7 22L17 22" {...stroke} />
      <path
        d="M2 17V4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z"
        {...plainStroke}
      />
      <path d="M9 10.5L11 12.5L15 8.5" {...stroke} />
    </IconBase>
  );
}

export function ServerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M5 12V18C5 18 5 21 12 21C19 21 19 18 19 18V12" {...plainStroke} />
      <path d="M5 6V12C5 12 5 15 12 15C19 15 19 12 19 12V6" {...plainStroke} />
      <path
        d="M12 3C19 3 19 6 19 6C19 6 19 9 12 9C5 9 5 6 5 6C5 6 5 3 12 3Z"
        {...plainStroke}
      />
    </IconBase>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M5 20V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V20"
        {...stroke}
      />
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        {...stroke}
      />
    </IconBase>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M18 8.4C18 6.70261 17.3679 5.07475 16.2426 3.87452C15.1174 2.67428 13.5913 2 12 2C10.4087 2 8.88258 2.67428 7.75736 3.87452C6.63214 5.07475 6 6.70261 6 8.4C6 15.8667 3 18 3 18H21C21 18 18 15.8667 18 8.4Z"
        {...stroke}
      />
      <path
        d="M13.7295 21C13.5537 21.3031 13.3014 21.5547 12.9978 21.7295C12.6941 21.9044 12.3499 21.9965 11.9995 21.9965C11.6492 21.9965 11.3049 21.9044 11.0013 21.7295C10.6977 21.5547 10.4453 21.3031 10.2695 21"
        {...stroke}
      />
    </IconBase>
  );
}

export function TvIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M2 21L17 21" {...stroke} />
      <path d="M21 21L22 21" {...stroke} />
      <path
        d="M2 16.4V3.6C2 3.26863 2.26863 3 2.6 3H21.4C21.7314 3 22 3.26863 22 3.6V16.4C22 16.7314 21.7314 17 21.4 17H2.6C2.26863 17 2 16.7314 2 16.4Z"
        {...plainStroke}
      />
    </IconBase>
  );
}

export function LogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M5 3.6C5 3.26863 5.26863 3 5.6 3H15L19 7V20.4C19 20.7314 18.7314 21 18.4 21H5.6C5.26863 21 5 20.7314 5 20.4V3.6Z"
        {...plainStroke}
      />
      <path d="M14.5 3V7.5H19" {...stroke} />
      <path d="M8.5 12H15.5M8.5 16H13" {...stroke} />
    </IconBase>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 7H20" {...stroke} />
      <path d="M9.5 7V5.5C9.5 5.22386 9.72386 5 10 5H14C14.2761 5 14.5 5.22386 14.5 5.5V7" {...stroke} />
      <path d="M6 7L6.8 19.1C6.82 19.6 7.24 20 7.74 20H16.26C16.76 20 17.18 19.6 17.2 19.1L18 7" {...stroke} />
      <path d="M10 11V16M14 11V16" {...stroke} />
    </IconBase>
  );
}

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4 12a8 8 0 1 0 2.5-5.8" {...stroke} />
      <path d="M3.5 4.5V9.5H8.5" {...stroke} />
      <path d="M12 7.5V12L15 14" {...stroke} />
    </IconBase>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21H20.47A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"
        {...stroke}
      />
      <path d="M12 9V13" {...stroke} />
      <path d="M12 17H12.01" {...stroke} />
    </IconBase>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="4.75" y="10.25" width="14.5" height="9" rx="2" {...stroke} />
      <path
        d="M8.25 10.25V7.5C8.25 5.43 9.93 3.75 12 3.75C14.07 3.75 15.75 5.43 15.75 7.5V10.25"
        {...stroke}
      />
    </IconBase>
  );
}

export function NoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M4.5 4.6C4.5 4.26863 4.76863 4 5.1 4H14L19.5 9.5V19.4C19.5 19.7314 19.2314 20 18.9 20H5.1C4.76863 20 4.5 19.7314 4.5 19.4V4.6Z"
        {...plainStroke}
      />
      <path d="M13.5 4V10H19.5" {...stroke} />
      <path d="M8 13H14M8 16.5H12" {...stroke} />
    </IconBase>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="17.5" cy="6" r="2.5" {...plainStroke} />
      <circle cx="6.5" cy="12" r="2.5" {...plainStroke} />
      <circle cx="17.5" cy="18" r="2.5" {...plainStroke} />
      <path d="M8.9 10.8L15.1 7.2M8.9 13.2L15.1 16.8" {...stroke} />
    </IconBase>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 5.5V18.5M5.5 12H18.5" {...stroke} />
    </IconBase>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9.5 5.5L16 12L9.5 18.5" {...stroke} />
    </IconBase>
  );
}

export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M3.5 6.1C3.5 5.76863 3.76863 5.5 4.1 5.5H9.2L11.2 8H19.9C20.2314 8 20.5 8.26863 20.5 8.6V17.9C20.5 18.2314 20.2314 18.5 19.9 18.5H4.1C3.76863 18.5 3.5 18.2314 3.5 17.9V6.1Z"
        {...plainStroke}
      />
    </IconBase>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4.5 19.5L5.2 15.8L15.9 5.1C16.3 4.7 16.9 4.7 17.3 5.1L18.9 6.7C19.3 7.1 19.3 7.7 18.9 8.1L8.2 18.8L4.5 19.5Z" {...plainStroke} />
      <path d="M14.4 6.6L17.4 9.6" {...stroke} />
    </IconBase>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 4V15M12 15L8 11M12 15L16 11" {...stroke} />
      <path d="M4.5 17V19.4C4.5 19.7314 4.76863 20 5.1 20H18.9C19.2314 20 19.5 19.7314 19.5 19.4V17" {...stroke} />
    </IconBase>
  );
}

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 16V5M12 5L8 9M12 5L16 9" {...stroke} />
      <path d="M4.5 17V19.4C4.5 19.7314 4.76863 20 5.1 20H18.9C19.2314 20 19.5 19.7314 19.5 19.4V17" {...stroke} />
    </IconBase>
  );
}

export function ListViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M4.5 7H19.5M4.5 12H19.5M4.5 17H19.5" {...stroke} />
    </IconBase>
  );
}

export function CardViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4.5" width="7" height="7" rx="1" {...plainStroke} />
      <rect x="13" y="4.5" width="7" height="7" rx="1" {...plainStroke} />
      <rect x="4" y="13" width="7" height="7" rx="1" {...plainStroke} />
      <rect x="13" y="13" width="7" height="7" rx="1" {...plainStroke} />
    </IconBase>
  );
}

export function NarrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="7" y="4.5" width="10" height="15" rx="1" {...plainStroke} />
      <path d="M4 7.5V16.5M20 7.5V16.5" {...stroke} />
    </IconBase>
  );
}

export function WideIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" {...plainStroke} />
      <path d="M7 9H17M7 12.5H17M7 16H13" {...stroke} />
    </IconBase>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M12 4L14.4 9.1L20 9.9L16 13.8L16.9 19.4L12 16.8L7.1 19.4L8 13.8L4 9.9L9.6 9.1L12 4Z"
        {...plainStroke}
      />
    </IconBase>
  );
}

export function StarFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path
        d="M12 4L14.4 9.1L20 9.9L16 13.8L16.9 19.4L12 16.8L7.1 19.4L8 13.8L4 9.9L9.6 9.1L12 4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function UnlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.2" {...plainStroke} />
      <path d="M8.2 10.5V7.8C8.2 5.7 9.9 4 12 4C13.7 4 15.2 5.1 15.7 6.7" {...stroke} />
    </IconBase>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" {...plainStroke} />
      <path d="M12 7.5V12L15 14" {...stroke} />
    </IconBase>
  );
}

export function ServerLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="6" rx="1" {...plainStroke} />
      <rect x="4" y="13" width="16" height="6" rx="1" {...plainStroke} />
      <path d="M7.5 8H8.5M7.5 16H8.5" {...stroke} />
    </IconBase>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3.2" {...plainStroke} />
      <path d="M3.5 19.5C3.5 16.6 5.9 14.5 9 14.5C12.1 14.5 14.5 16.6 14.5 19.5" {...stroke} />
      <path d="M16 5.2C17.5 5.6 18.5 6.7 18.5 8.2C18.5 9.6 17.6 10.7 16.3 11.1" {...stroke} />
      <path d="M17.5 14.9C19.4 15.5 20.5 16.9 20.5 19" {...stroke} />
    </IconBase>
  );
}
