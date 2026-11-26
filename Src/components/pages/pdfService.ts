import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

// Configure pdf.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

/**
 * Extract text from a PDF file (page by page).
 * Returns plain text that can later be turned into a simple .docx-like structure.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(strings)
  }

  return pages.join('\n\n--- Page Break ---\n\n')
}

/**
 * Create a simple PDF from plain text (used by Word → PDF path).
 */
export async function createPdfFromText(text: string, title = 'Document'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 11
  const lineHeight = 16
  const margin = 50
  const pageWidth = 595 // A4
  const pageHeight = 842
  const maxWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Simple word wrap
  const words = text.split(/\s+/)
  let line = ''

  const drawLine = (str: string) => {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
    page.drawText(str, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    y -= lineHeight
  }

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)
    if (width > maxWidth && line) {
      drawLine(line)
      line = word
    } else {
      line = testLine
    }
  }
  if (line) drawLine(line)

  // Set metadata
  pdfDoc.setTitle(title)
  pdfDoc.setProducer('PDF Word')
  pdfDoc.setCreator('PDF Word')

  return pdfDoc.save()
}

/**
 * Merge multiple PDF files into one.
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }

  return merged.save()
}

/**
 * Split a PDF: extract specific pages (1-based).
 * Returns a new PDF containing only the requested pages.
 */
export async function splitPdf(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer()
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const out = await PDFDocument.create()

  const indices = pageNumbers
    .map((n) => n - 1)
    .filter((i) => i >= 0 && i < src.getPageCount())

  const pages = await out.copyPages(src, indices)
  pages.forEach((p) => out.addPage(p))

  return out.save()
}

/**
 * Very simple compression: load and re-save with object streams.
 * (Real image compression would need more advanced processing.)
 */
export async function compressPdf(file: File): Promise<{ data: Uint8Array; originalSize: number; newSize: number }> {
  const originalBytes = new Uint8Array(await file.arrayBuffer())
  const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true })

  // Re-save with compression options available in pdf-lib
  const compressed = await doc.save({ useObjectStreams: true })

  return {
    data: compressed,
    originalSize: originalBytes.length,
    newSize: compressed.length,
  }
}

/**
 * Helper: trigger browser download of a Uint8Array or Blob.
 */
export function downloadBytes(data: Uint8Array, filename: string, mime = 'application/pdf') {
  const blob = new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Create a minimal .docx (ZIP of XML) from plain text.
 * This produces a valid Word document that opens in Microsoft Word / LibreOffice.
 */
export async function createDocxFromText(text: string, title = 'Document'): Promise<Uint8Array> {
  // Minimal Office Open XML structure
  const escapeXml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const paragraphs = text
    .split(/\n+/)
    .map((p) => {
      const content = escapeXml(p.trim() || ' ')
      return `<w:p><w:r><w:t xml:space="preserve">${content}</w:t></w:r></w:p>`
    })
    .join('')

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

  // We need a real ZIP. Use the browser's CompressionStream if available, otherwise a tiny pure JS zip.
  // For simplicity and reliability we use a minimal ZIP writer.
  return createMinimalZip({
    '[Content_Types].xml': contentTypes,
    '_rels/.rels': rels,
    'word/document.xml': documentXml,
  })
}

/** Minimal ZIP creator (store method only – no compression). Good enough for small docs. */
function createMinimalZip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder()
  const localHeaders: Uint8Array[] = []
  const centralHeaders: Uint8Array[] = []
  let offset = 0

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name)
    const dataBytes = encoder.encode(content)
    const crc = crc32(dataBytes)

    // Local file header
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length)
    const view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true) // signature
    view.setUint16(8, 0, true) // method = store
    view.setUint32(14, crc, true)
    view.setUint32(18, dataBytes.length, true) // compressed size
    view.setUint32(22, dataBytes.length, true) // uncompressed size
    view.setUint16(26, nameBytes.length, true)
    local.set(nameBytes, 30)
    local.set(dataBytes, 30 + nameBytes.length)
    localHeaders.push(local)

    // Central directory header
    const central = new Uint8Array(46 + nameBytes.length)
    const cview = new DataView(central.buffer)
    cview.setUint32(0, 0x02014b50, true)
    cview.setUint16(10, 0, true) // method
    cview.setUint32(16, crc, true)
    cview.setUint32(20, dataBytes.length, true)
    cview.setUint32(24, dataBytes.length, true)
    cview.setUint16(28, nameBytes.length, true)
    cview.setUint32(42, offset, true)
    central.set(nameBytes, 46)
    centralHeaders.push(central)

    offset += local.length
  }

  const centralSize = centralHeaders.reduce((s, h) => s + h.length, 0)
  const end = new Uint8Array(22)
  const eview = new DataView(end.buffer)
  eview.setUint32(0, 0x06054b50, true)
  eview.setUint16(8, centralHeaders.length, true)
  eview.setUint16(10, centralHeaders.length, true)
  eview.setUint32(12, centralSize, true)
  eview.setUint32(16, offset, true)

  // Concatenate everything
  const total = offset + centralSize + 22
  const result = new Uint8Array(total)
  let pos = 0
  for (const h of localHeaders) {
    result.set(h, pos)
    pos += h.length
  }
  for (const h of centralHeaders) {
    result.set(h, pos)
    pos += h.length
  }
  result.set(end, pos)
  return result
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  const table = getCrcTable()
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

let crcTable: number[] | null = null
function getCrcTable(): number[] {
  if (crcTable) return crcTable
  crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    crcTable[n] = c
  }
  return crcTable
}
