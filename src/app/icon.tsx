import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// Favicon size — 64×64 is displayed in browser tabs
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Serves the real THOFNAA logo PNG as the browser tab favicon.
 * The logo file lives at /public/thofnaa-logo.png.
 */
export default async function Icon() {
  const logoPath = path.join(process.cwd(), "public", "thofnaa-logo.png");
  const logoData = fs.readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="THOFNAA Institute"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
