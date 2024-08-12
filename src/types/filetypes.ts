export const textExtensions = [
  ".txt",
  ".md",
  ".js",
  ".ts",
  ".html",
  ".css",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".ini",
  ".cfg",
  ".conf",
  ".log",
  ".csv",
  ".tsv",
  ".rtf",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
  ".rb",
  ".php",
  ".sql",
  ".sh",
  ".bat",
] as const;

export const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".svg",
  ".tiff",
  ".tif",
  ".ico",
  ".psd",
  ".ai",
  ".eps",
  ".raw",
] as const;

export const audioExtensions = [
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".aac",
  ".wma",
  ".m4a",
  ".aiff",
  ".midi",
] as const;

export const videoExtensions = [
  ".mp4",
  ".webm",
  ".ogg",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".mkv",
  ".m4v",
  ".3gp",
  ".mpeg",
  ".mpg",
] as const;

export type FileType = "text" | "image" | "audio" | "video" | "other";

export function getFileType(extension: string): FileType {
  const lowerExt = extension.toLowerCase();
  if (textExtensions.includes(lowerExt as any)) return "text";
  if (imageExtensions.includes(lowerExt as any)) return "image";
  if (audioExtensions.includes(lowerExt as any)) return "audio";
  if (videoExtensions.includes(lowerExt as any)) return "video";
  return "other";
}
