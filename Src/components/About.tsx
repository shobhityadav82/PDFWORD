export default function About() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 prose dark:prose-invert">
      <div>
        <h1 className="text-2xl font-bold">About PDF Word</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          A small, privacy-first collection of PDF tools that run entirely inside your browser.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Privacy promise</h2>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-5">
          <li>Files are never uploaded to any server.</li>
          <li>All processing (text extraction, merge, split, compression) happens on your device.</li>
          <li>No accounts, no tracking, no analytics of your documents.</li>
          <li>After you close the tab, nothing remains on our side — because there is no “our side” for your PDFs.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What this app can do</h2>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-5">
          <li><strong>PDF → Word</strong> — extract text and produce a clean .docx</li>
          <li><strong>Word → PDF</strong> — convert text / simple .docx into PDF</li>
          <li><strong>Merge</strong> — combine multiple PDFs</li>
          <li><strong>Split</strong> — extract selected pages</li>
          <li><strong>Compress</strong> — reduce file size with object streams</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Limitations (honest)</h2>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-5">
          <li>Scanned / image-only PDFs need OCR (not included in this version).</li>
          <li>Complex layouts, fonts, tables and images are not fully preserved in conversions.</li>
          <li>Password-protected PDFs are not supported yet.</li>
          <li>Compression is light; heavy image PDFs may not shrink much.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tech stack</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          React + TypeScript + Vite + Tailwind CSS + pdf-lib + pdf.js.
          Everything is open and runs client-side.
        </p>
      </section>

      <section className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 text-sm text-slate-600 dark:text-slate-400">
        <p>
          PDF Word is an independent project. It was built from scratch with a focus on simplicity
          and privacy. It is not affiliated with any other PDF tool.
        </p>
      </section>
    </div>
  )
}
