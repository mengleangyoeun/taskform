"use client";

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { DocumentSettings } from "@/types/document";

export async function exportToPdf(
  elementId: string,
  filename: string,
  settings: DocumentSettings
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Element #${elementId} not found`);
  }

  // Generate high-resolution canvas image
  const imgData = await toPng(node, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const isLandscape = settings.orientation === "landscape";
  const format = settings.paperSize === "letter" ? "letter" : "a4";

  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: format,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Create an image element to measure natural dimensions
  const img = new Image();
  img.src = imgData;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const imgWidth = pdfWidth;
  const imgHeight = (img.height * pdfWidth) / img.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages if content exceeds 1 page
  while (heightLeft > 5) {
    position = position - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9]/g, "-");
  pdf.save(`${cleanFilename}.pdf`);
}
