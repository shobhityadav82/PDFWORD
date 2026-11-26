import { Link } from 'react-router-dom'
import { FileText, Layers, Scissors, Shrink, ArrowRight } from 'lucide-react'

const tools = [
  {
    path: '/pdf-to-word',
    title: 'PDF to Word',
    description: 'Extract text from PDF and download as editable .docx file. Fully local.',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    path: '/word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert .docx files into clean PDF documents right in the browser.',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    path: '/merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one single document.',
    icon: Layers,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    path: '/split',
    title: 'Split PDF',
    description: 'Extract specific pages or split a PDF into separate files.',
    icon: Scissors,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    path: '/compress',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while keeping good quality.',
    icon: Shrink,
    color: 'bg-rose-100 text-rose-700',
  },
]

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          PDF Word
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Private PDF tools that run entirely in your browser.
          Convert between PDF and Word, merge, split, compress — no uploads, no accounts.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/pdf-to-word"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition"
          >
            Start with PDF → Word
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Why privacy first?
          </Link>
        </div>
      </section>

      {/* Tools grid */}
      <section>
        <h2 className="text-xl font-semibold mb-5">Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition"
              >
                <div className={`inline-flex p-2.5 rounded-xl ${tool.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg group-hover:text-brand-600 transition">
                  {tool.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {tool.description}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Privacy note */}
      <section className="rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 p-6 text-center">
        <h3 className="font-semibold text-brand-800 dark:text-brand-200">
          Your files never leave your device
        </h3>
        <p className="mt-2 text-sm text-brand-700 dark:text-brand-300 max-w-xl mx-auto">
          All conversion and processing happens inside your browser using WebAssembly and local libraries.
          We do not run any PDF processing server.
        </p>
      </section>
    </div>
  )
}
