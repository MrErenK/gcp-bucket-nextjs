import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const UNIT = size.width / 16;

const BARS = [
  { id: "top", left: 4, top: 3, width: 8, height: 2 },
  { id: "middle", left: 6, top: 7, width: 6, height: 2 },
  { id: "bottom", left: 4, top: 11, width: 8, height: 2 },
  { id: "spine", left: 4, top: 3, width: 2, height: 10 },
];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: size.width,
          height: size.height,
          background: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            border: `${UNIT}px solid #000000`,
          }}
        />
        {BARS.map((bar) => (
          <div
            key={bar.id}
            style={{
              position: "absolute",
              left: bar.left * UNIT,
              top: bar.top * UNIT,
              width: bar.width * UNIT,
              height: bar.height * UNIT,
              background: "#000000",
            }}
          />
        ))}
      </div>
    ),
    size,
  );
}
