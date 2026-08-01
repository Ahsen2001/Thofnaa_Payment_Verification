import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

// Dynamic Favicon Generator with White Background
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          borderRadius: "14px",
          border: "2px solid #12355B",
          boxShadow: "0 2px 8px rgba(18, 53, 91, 0.15)",
          position: "relative",
        }}
      >
        {/* THOFNAA Flame & Book Emblem */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gold Star Accent */}
          <path
            d="M78 20L80.5 27.5L88 30L80.5 32.5L78 40L75.5 32.5L68 30L75.5 27.5L78 20Z"
            fill="#E7B33E"
          />

          {/* Emerald Flame */}
          <path
            d="M50 15C50 15 65 32 60 48C56 38 48 32 48 32C48 32 44 42 38 44C34 38 38 25 50 15Z"
            fill="#159A6A"
          />
          <path
            d="M48 24C48 24 56 36 52 46C49 39 44 35 44 35C44 35 42 41 38 42C35 38 38 30 48 24Z"
            fill="#10B981"
          />

          {/* Navy Open Book */}
          <path
            d="M15 68C28 62 45 62 50 68C55 62 72 62 85 68V48C72 42 55 42 50 48C45 42 28 42 15 48V68Z"
            fill="#12355B"
            stroke="#12355B"
            strokeWidth="3"
          />
          <path
            d="M50 48V72"
            stroke="#E7B33E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Base Ribbon */}
          <path
            d="M20 74C32 70 45 70 50 74C55 70 68 70 80 74"
            stroke="#E7B33E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
