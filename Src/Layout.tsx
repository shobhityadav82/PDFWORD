import { Link, useLocation } from 'react-router-dom'
import { FileText, Home, Info, Layers, Scissors, Shrink } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/pdf-to-word', label: 'PDF → Word', icon: FileText },
  { path: '/word-to-pdf', label: 'Word → PDF', icon: FileText },
  { path: '/merge', label: 'Merge', icon: Layers },
  { path: '/split', label: 'Split', icon: Scissors },
  { path: '/compress', label: 'Compress', icon: Shrink },
  { path: '/about', label: 'About', icon: Info },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
            <FileText className="w-7 h-7" />
            <span>PDF Word</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden sticky top-[57px] z-40 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-x-auto">
        <div className="flex gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  active
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-12 py-6 text-center text-sm text-slate-500">
        <p>
          PDF Word — All processing happens locally in your browser. No files are uploaded.
        </p>
        <p className="mt-1">
          Open source • Privacy first • No account required
        </p>
      </footer>
    </div>
  )
}
