import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker using a blob URL for Vite compatibility
const workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Extracts text content from a PDF file.
 * @param file - The PDF file to extract text from
 * @returns Promise resolving to the extracted text content
 * @throws Error if the file is not a PDF or extraction fails
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Validate file type
  if (file.type !== "application/pdf") {
    throw new Error("Invalid file type. Please select a PDF file.");
  }

  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Extract text from all pages
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n\n");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF");
  }
}
