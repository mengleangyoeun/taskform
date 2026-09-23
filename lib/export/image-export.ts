"use client";

import { toPng, toJpeg } from "html-to-image";
import { downloadDataUrl } from "@/lib/export/download";

export async function exportToImage(
  elementId: string,
  filename: string,
  format: "png" | "jpeg" = "png"
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Element #${elementId} not found`);
  }

  const options = {
    quality: 0.95,
    pixelRatio: 2, // High DPI for crisp print-grade rendering
    backgroundColor: "#ffffff",
  };

  let dataUrl: string;
  if (format === "png") {
    dataUrl = await toPng(node, options);
  } else {
    dataUrl = await toJpeg(node, options);
  }

  const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9]/g, "-");
  downloadDataUrl(dataUrl, `${cleanFilename}.${format}`);
}
