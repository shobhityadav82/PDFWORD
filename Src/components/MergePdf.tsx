import { useState } from 'react'
import { FileUp, Download, Loader2, Trash2, AlertCircle } from 'lucide-react'
import { mergePdfs, downloadBytes } from '../services/pdfService'

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const pdfs = Array.from(list).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )
    setFiles((prev) => [...prev, ...pdfs])
    setStatus('idle')
    setMessage('')
  }

  const remove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const merge = async () => {
    if (files.length < 2) {
      setStatus('error')
      setMessage('Please add at least two PDF files.')
      return
    }
    setStatus('working')
    setMessage(`Merging ${files.length} files…`)
    try {
      const data = await mergePdfs(files)
      downloadBytes(data, 'merged.pdf')
      setStatus('done')
      setMessage(`Successfully merged ${files.length} PDFs into merged.pdf`)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'Merge failed. One of the files may be encrypted or invalid.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Merge PDFs</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Combine multiple PDF files into a single document. Order is preserved.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-brand-400 transition">
        <FileUp className="w-9 h-9 text-slate-400" />
        <span className="font-medium">Add PDF files</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <span className="text-sm truncate">
                {i + 1}. {f.name}
              </span>
              <button
                onClick={() => remove(i)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length >= 2 && (
        <button
          onClick={merge}
          disabled={status === 'working'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition"
        >
          {status === 'working' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Merging…
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Merge & Download
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
