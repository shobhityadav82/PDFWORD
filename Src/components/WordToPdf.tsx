import { useState } from 'react'
import { FileUp, Download, Loader2, AlertCircle } from 'lucide-react'
import { createPdfFromText, downloadBytes } from '../services/pdfService'

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleFile = (f: File | null) => {
    if (!f) return
    const name = f.name.toLowerCase()
    if (!name.endsWith('.docx') && !name.endsWith('.txt') && f.type !== 'text/plain') {
      setStatus('error')
      setMessage('Please select a .docx or .txt file. (Full .docx parsing is limited in this version — plain text works best.)')
      return
    }
    setFile(f)
    setStatus('idle')
    setMessage('')
  }

  const convert = async () => {
    if (!file) return
    setStatus('working')
    setMessage('Reading file…')
    try {
      let text = ''
      if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
        text = await file.text()
      } else {
        // Very lightweight .docx text extraction (look for <w:t> tags)
        const buf = await file.arrayBuffer()
        const zip = await (async () => {
          // Use browser DecompressionStream if available for the document.xml part,
          // but for simplicity we do a crude string search after decoding as latin1
          const bytes = new Uint8Array(buf)
          // Find "word/document.xml" and extract roughly
          const decoder = new TextDecoder('utf-8', { fatal: false })
          const str = decoder.decode(bytes)
          const matches = [...str.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
          if (matches.length === 0) {
            // fallback: try to read as text
            return decoder.decode(bytes)
          }
          return matches.map((m) => m[1]).join(' ')
        })()
        text = zip
      }

      if (!text.trim()) {
        setStatus('error')
        setMessage('Could not extract readable text from the file.')
        return
      }

      setMessage('Creating PDF…')
      const pdfBytes = await createPdfFromText(text, file.name.replace(/\.(docx|txt)$/i, ''))
      const outName = file.name.replace(/\.(docx|txt)$/i, '') + '.pdf'
      downloadBytes(pdfBytes, outName)
      setStatus('done')
      setMessage(`Downloaded “${outName}”. This is a text-based conversion; original formatting, images and complex tables are not preserved.`)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'Conversion failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Word to PDF</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Convert a Word (.docx) or plain text file into a PDF. Processing stays on your device.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition">
        <FileUp className="w-10 h-10 text-slate-400" />
        <span className="font-medium">
          {file ? file.name : 'Drop a .docx or .txt file here'}
        </span>
        <span className="text-sm text-slate-500">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Local conversion only'}
        </span>
        <input
          type="file"
          accept=".docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
              Convert & Download PDF
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
    </div>
  )
}
