import PizZip from "pizzip";
import { createHash } from "crypto";
import Docxtemplater from "docxtemplater";

export interface PlaceholderExtractionResult {
  placeholders: string[];
  contentHash: string;
}

export async function extractPlaceholdersFromDocx(
  fileBuffer: Buffer
): Promise<PlaceholderExtractionResult> {
  const zip = new PizZip(fileBuffer);
  const placeholderSet = new Set<string>();
  
  const partsToCheck = [
    "word/document.xml",
    "word/header1.xml",
    "word/header2.xml",
    "word/header3.xml",
    "word/footer1.xml",
    "word/footer2.xml",
    "word/footer3.xml",
  ];

  for (const part of partsToCheck) {
    try {
      const content = zip.file(part)?.asText();
      if (!content) continue;

      const textNodes = extractTextFromXml(content);
      const concatenatedText = textNodes.join("");
      const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
      let match;

      while ((match = regex.exec(concatenatedText)) !== null) {
        placeholderSet.add(match[1]);
      }
    } catch (error) {
      continue;
    }
  }

  const contentHash = createHash("sha256").update(fileBuffer).digest("hex");

  return {
    placeholders: Array.from(placeholderSet).sort(),
    contentHash,
  };
}

function extractTextFromXml(xmlContent: string): string[] {
  const textNodes: string[] = [];
  const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;

  while ((match = regex.exec(xmlContent)) !== null) {
    if (match[1]) {
      textNodes.push(match[1]);
    }
  }

  return textNodes;
}

export function validateDocxFile(buffer: Buffer, filename: string): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024;
  const maxEntrySize = 50 * 1024 * 1024;
  const maxCompressionRatio = 100;
  
  if (buffer.length > maxSize) {
    return { valid: false, error: "File size exceeds 5MB limit" };
  }

  if (!filename.toLowerCase().endsWith(".docx")) {
    return { valid: false, error: "Only .docx files are supported" };
  }

  try {
    const zip = new PizZip(buffer);
    
    const contentTypes = zip.file("[Content_Types].xml")?.asText();
    if (!contentTypes) {
      return { valid: false, error: "Invalid DOCX file structure" };
    }

    if (contentTypes.includes("application/vnd.ms-word.document.macroEnabled")) {
      return { valid: false, error: "Macro-enabled documents are not allowed for security reasons" };
    }

    const entryCount = Object.keys(zip.files).length;
    if (entryCount > 1000) {
      return { valid: false, error: "File contains too many entries (possible zip bomb)" };
    }

    for (const filename in zip.files) {
      const file = zip.files[filename];
      if (file.dir) continue;

      const uncompressedSize = file.asText().length;
      if (uncompressedSize > maxEntrySize) {
        return { valid: false, error: "File contains entries that are too large" };
      }

      const compressedSize = buffer.length / entryCount;
      if (compressedSize > 0 && uncompressedSize / compressedSize > maxCompressionRatio) {
        return { valid: false, error: "File has suspicious compression ratio (possible zip bomb)" };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Failed to parse DOCX file" };
  }
}

export function fillDocxTemplate(
  templateBuffer: Buffer,
  placeholderValues: Record<string, string | number>
): Buffer {
  const zip = new PizZip(templateBuffer);
  
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(placeholderValues);

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buf;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
