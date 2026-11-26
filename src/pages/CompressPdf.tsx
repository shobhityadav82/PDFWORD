import { useState } from 'react'
import { FileUp, Download, Loader2, AlertCircle } from 'lucide-react'
import { compressPdf, downloadBytes } from '../services/pdfService'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null)

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
    setResult(null)
  }

  const run = async () => {
    if (!file) return
    setStatus('working')
    setMessage('Compressing…')
    try {
      const { data, originalSize, newSize } = await compressPdf(file)
      const outName = file.name.replace(/\.pdf$/i, '') + '_compressed.pdf'
      downloadBytes(data, outName)
      setResult({ original: originalSize, compressed: newSize })
      setStatus('done')
      const ratio = ((1 - newSize / originalSize) * 100).toFixed(1)
      setMessage(
        newSize < originalSize
          ? `Saved ${ratio}% — downloaded “${outName}”`
          : `File was already well optimized. Downloaded “${outName}”`
      )
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'Compression failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compress PDF</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Reduce PDF size using object stream compression. Best results on text-heavy documents.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-brand-400 transition">
        <FileUp className="w-9 h-9 text-slate-400" />
        <span className="font-medium">
          {file ? file.name : 'Select a PDF to compress'}
        </span>
        {file && (
          <span className="text-sm text-slate-500">{formatSize(file.size)}</span>
        )}
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>

      {file && (
        <button
          onClick={run}
          disabled={status === 'working'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {status === 'working' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Compressing…
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Compress & Download
            </>
          )}
        </button>
      )}

      {result && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
            <div className="text-xs text-slate-500">Original</div>
            <div className="font-semibold text-lg">{formatSize(result.original)}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Compressed</div>
            <div className="font-semibold text-lg">{formatSize(result.compressed)}</div>
          </div>
        </div>
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
