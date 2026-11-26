import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import PdfToWord from './pages/PdfToWord'
import WordToPdf from './pages/WordToPdf'
import MergePdf from './pages/MergePdf'
import SplitPdf from './pages/SplitPdf'
import CompressPdf from './pages/CompressPdf'
import About from './pages/About'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pdf-to-word" element={<PdfToWord />} />
        <Route path="/word-to-pdf" element={<WordToPdf />} />
        <Route path="/merge" element={<MergePdf />} />
        <Route path="/split" element={<SplitPdf />} />
        <Route path="/compress" element={<CompressPdf />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  )
}
