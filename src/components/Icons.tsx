import React from "react";
import { getFileType, FileType } from "@/types/filetypes";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const defaultIconProps: IconProps = {
  size: 24,
  color: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

interface SortIconProps {
  className?: string;
  order: "asc" | "desc";
  type: "name" | "date" | "size" | "downloads" | "default";
}

const createIcon = (path: React.ReactNode) => {
  return ({ size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...defaultIconProps}
      {...props}
    >
      {path}
    </svg>
  );
};

const CloudIcon = createIcon(
  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
);

const CopyIcon = createIcon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
);

const DownloadIcon = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </>,
);

const FileIcon = createIcon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </>,
);

const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </>,
);

const MoonIcon = createIcon(
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
);

const UploadIcon = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </>,
);

const XIcon = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);

const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

const GithubIcon = createIcon(
  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
);

const LoadingIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </>,
);

const RefreshIcon = createIcon(
  <>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </>,
);

const ArrowLeftIcon = createIcon(
  <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />,
);

const AllFilesIcon = createIcon(
  <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />,
);

const HomeIcon = createIcon(
  <>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>,
);

const TelegramIcon = createIcon(
  <>
    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-17.15 6.498a2.268 2.268 0 0 0-.214 4.180l3.608 1.707a1.417 1.417 0 0 0 1.635-.409l5.725-6.950a.563.563 0 0 1 .827.758l-5.725 6.95a1.406 1.406 0 0 0-.409 1.635l1.707 3.608a2.268 2.268 0 0 0 4.180-.214l6.498-17.15a2.242 2.242 0 0 0-1.215-2.572" />
  </>,
);

const PlusIcon = createIcon(<path d="M12 4v16m8-8H4" />);

const RefreshCwIcon = createIcon(
  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
);

const TrashIcon = createIcon(
  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
);

const LockIcon = createIcon(
  <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
);

const EyeIcon = createIcon(
  <>
    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </>,
);

const EyeOffIcon = createIcon(
  <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />,
);

const MenuIcon = createIcon(
  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
);

const HeartIcon = createIcon(
  <>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill="red"
    />
  </>,
);

const InfoIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>,
);

const ChevronLeftIcon = createIcon(<polyline points="15 18 9 12 15 6" />);

const ChevronRightIcon = createIcon(<polyline points="9 18 15 12 9 6" />);

const PlayIcon = createIcon(<polygon points="5 3 19 12 5 21 5 3" />);

const PauseIcon = createIcon(
  <>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </>,
);

const ZoomInIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>,
);

const ZoomOutIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </>,
);

const CheckIcon = createIcon(<polyline points="20 6 9 17 4 12" />);

const VolumeUpIcon = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </>,
);

const VolumeDownIcon = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </>,
);

const VolumeOffIcon = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>,
);

const FullscreenIcon = createIcon(
  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
);

const FullscreenExitIcon = createIcon(
  <path d="M4 14h3v3m14-3h-3v3M4 10h3V7m14 3h-3V7" />,
);

export const SortIcon: React.FC<SortIconProps> = ({
  className,
  order,
  type,
}) => {
  const renderIcon = () => {
    switch (type) {
      case "name":
        return (
          <>
            <path d="M3 7h10" />
            <path d="M3 11h7" />
            <path d="M3 15h4" />
            <path d="M17 7v10" />
            <path d={order === "asc" ? "m14 14 3 3 3-3" : "m14 10 3-3 3 3"} />
          </>
        );
      case "date":
        return (
          <>
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d={order === "asc" ? "m9 14 3 3 3-3" : "m9 16 3-3 3 3"} />
          </>
        );
      case "size":
        return (
          <>
            {order === "asc" ? (
              <>
                <rect x="4" y="14" width="6" height="6" />
                <rect x="14" y="6" width="6" height="14" />
              </>
            ) : (
              <>
                <rect x="4" y="4" width="6" height="16" />
                <rect x="14" y="14" width="6" height="6" />
              </>
            )}
          </>
        );
      case "downloads":
        return (
          <>
            <path d="M12 4v16" />
            <path d={order === "asc" ? "m5 13 7 7 7-7" : "m5 11 7-7 7 7"} />
          </>
        );
      default:
        return (
          <>
            <path d="M12 20V4" />
            <path d={order === "asc" ? "m5 11 7-7 7 7" : "m5 13 7 7 7-7"} />
          </>
        );
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {renderIcon()}
    </svg>
  );
};

const DownloadCountIcon = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </>,
);

const ApiKeyIcon = createIcon(
  <>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </>,
);

const FileStatsIcon = createIcon(
  <>
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <polyline
      points="14 2 14 8 20 8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line
      x1="16"
      y1="13"
      x2="8"
      y2="13"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="17"
      x2="8"
      y2="17"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9h2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

const RenameIcon = createIcon(
  <>
    <path
      d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M15 5l4 4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

const FileManagerIcon = createIcon(
  <>
    <path
      d="M3 5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M3 7h18"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12h6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 15h6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

const ArchiveIcon = createIcon(
  <>
    <path
      d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M1 3h22v4H1z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M10 13h4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 16h6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 10h4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
);

const TextIcon = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>,
);

const ImageIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>,
);

const VideoIcon = createIcon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </>,
);

const AudioIcon = createIcon(
  <>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </>,
);

const PdfIcon = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15v-4h6v4H9z" />
    <path d="M9 15h6" />
    <path d="M9 13h6" />
  </>,
);

const CodeIcon = createIcon(
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>,
);

function getFileIcon(fileName: string) {
  const extension = fileName.split(".").pop() || "";
  const fileType = getFileType(`.${extension}`);

  switch (fileType) {
    case "text":
      return TextIcon;
    case "image":
      return ImageIcon;
    case "audio":
      return AudioIcon;
    case "video":
      return VideoIcon;
    default:
      // You can add more specific checks here if needed
      if (extension === "pdf") return PdfIcon;
      if (["zip", "rar", "7z", "tar", "gz"].includes(extension))
        return ArchiveIcon;
      if (["js", "ts", "py", "java", "cpp", "html", "css"].includes(extension))
        return CodeIcon;
      return FileIcon;
  }
}

export {
  CloudIcon,
  CopyIcon,
  DownloadIcon,
  FileIcon,
  SunIcon,
  MoonIcon,
  UploadIcon,
  XIcon,
  SearchIcon,
  GithubIcon,
  LoadingIcon,
  RefreshIcon,
  ArrowLeftIcon,
  AllFilesIcon,
  HomeIcon,
  TelegramIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  MenuIcon,
  HeartIcon,
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CheckIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  VolumeDownIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  DownloadCountIcon,
  ApiKeyIcon,
  FileStatsIcon,
  RenameIcon,
  FileManagerIcon,
  ArchiveIcon,
  TextIcon,
  ImageIcon,
  VideoIcon,
  AudioIcon,
  PdfIcon,
  CodeIcon,
  getFileIcon,
};
