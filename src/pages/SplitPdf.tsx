import { useState } from 'react'
import { FileUp, Download, Loader2, AlertCircle } from 'lucide-react'
import { splitPdf, downloadBytes } from '../services/pdfService'

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState('')
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
  }

  const parsePages = (input: string): number[] => {
    const result: number[] = []
    const parts = input.split(/[,;\s]+/).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        if (!isNaN(a) && !isNaN(b) && a <= b) {
          for (let i = a; i <= b; i++) result.push(i)
        }
      } else {
        const n = Number(part)
        if (!isNaN(n) && n > 0) result.push(n)
      }
    }
    return [...new Set(result)].sort((a, b) => a - b)
  }

  const run = async () => {
    if (!file) return
    const pageNums = parsePages(pages)
    if (pageNums.length === 0) {
      setStatus('error')
      setMessage('Enter page numbers (e.g. 1,3,5-8).')
      return
    }
    setStatus('working')
    setMessage('Extracting pages…')
    try {
      const data = await splitPdf(file, pageNums)
      const outName = file.name.replace(/\.pdf$/i, '') + `_pages_${pageNums.join('-')}.pdf`
      downloadBytes(data, outName)
      setStatus('done')
      setMessage(`Downloaded “${outName}” containing ${pageNums.length} page(s).`)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'Split failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Split PDF</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Extract specific pages from a PDF into a new file.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-brand-400 transition">
        <FileUp className="w-9 h-9 text-slate-400" />
        <span className="font-medium">
          {file ? file.name : 'Select a PDF'}
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Pages to extract
            </label>
            <input
              type="text"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 1, 3, 5-8"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use commas and ranges. Example: 1,3,5-8
            </p>
          </div>

          <button
            onClick={run}
            disabled={status === 'working'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition"
          >
            {status === 'working' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Extracting…
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Extract & Download
              </>
            )}
          </button>
        </>
      )}

      {message && (
        <div
          className={`flex items-start gap-2 p-4 rounded-xl text-sm ${
            status === 'error'
              ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              : status === 'done'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
          }`}
        >
          {status === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}
