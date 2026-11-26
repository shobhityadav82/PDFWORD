import { useState } from 'react'
import { FileUp, Download, Loader2, AlertCircle } from 'lucide-react'
import { extractTextFromPdf, createDocxFromText, downloadBytes } from '../services/pdfService'

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [previewText, setPreviewText] = useState('')

  const handleFile = (f: File | null) => {
    if (!f) return
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error')
      setMessage('Please select a PDF file.')
      return
    }
    setFile(f)
    setStatus('idle')
    setMessage('')
    setPreviewText('')
  }

  const convert = async () => {
    if (!file) return
    setStatus('working')
    setMessage('Extracting text from PDF…')
    try {
      const text = await extractTextFromPdf(file)
      if (!text.trim()) {
        setStatus('error')
        setMessage('No extractable text found. This PDF may be image-only (scanned). OCR is not included in this version.')
        return
      }
      setPreviewText(text.slice(0, 2000) + (text.length > 2000 ? '…' : ''))
      setMessage('Creating Word document…')
      const docx = await createDocxFromText(text, file.name.replace(/\.pdf$/i, ''))
      const outName = file.name.replace(/\.pdf$/i, '') + '.docx'
      downloadBytes(docx, outName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      setStatus('done')
      setMessage(`Downloaded “${outName}”. Text extraction is best-effort; complex layouts may need manual cleanup.`)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'Conversion failed. The file may be encrypted or corrupted.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">PDF to Word</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Extract text from a PDF and download it as an editable .docx file. Everything runs locally.
        </p>
      </div>

      {/* Drop zone */}
      <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition">
        <FileUp className="w-10 h-10 text-slate-400" />
        <span className="font-medium">
          {file ? file.name : 'Drop a PDF here or click to browse'}
        </span>
        <span className="text-sm text-slate-500">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'PDF only • processed in browser'}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <button
          onClick={convert}
          disabled={status === 'working'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {status === 'working' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Working…
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Convert & Download Word
            </>
          )}
        </button>
      )}

      {message && (
        <div
          className={`flex items-start gap-2 p-4 rounded-xl text-sm ${
            status === 'error'
              ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              : status === 'done'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {status === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p>{message}</p>
        </div>
      )}

      {previewText && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Text preview</h3>
          <pre className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
            {previewText}
          </pre>
        </div>
      )}
    </div>
  )
}
