import { useState, useRef } from 'react'
import axios from 'axios'
import JournalInput  from './components/JournalInput'
import FindingsPanel from './components/FindingsPanel'
import Sidebar       from './components/Sidebar'
import ActivityLog   from './components/ActivityLog'

const API_BASE = 'http://localhost:8000'
const POLL_INTERVAL = 2500

export default function App() {
  const [loading, setLoading]           = useState(false)
  const [currentAgent, setCurrentAgent] = useState('')
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState(null)
  const pollRef                         = useRef(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function startPolling(jobId) {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/status/${jobId}`)
        setCurrentAgent(data.current_agent || '')
        if (data.status === 'complete') {
          stopPolling()
          setResult(data)
          setLoading(false)
        } else if (data.status === 'error') {
          stopPolling()
          setError(data.message || 'Pipeline error')
          setLoading(false)
        }
      } catch {
        stopPolling()
        setError('Lost connection to backend')
        setLoading(false)
      }
    }, POLL_INTERVAL)
  }

  async function handleSubmit(file, city, pastedText) {
    setLoading(true)
    setError(null)
    setResult(null)
    setCurrentAgent('agent1')
    stopPolling()
    try {
      let response
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        response = await axios.post(
          `${API_BASE}/review?city=${encodeURIComponent(city)}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
      } else {
        response = await axios.post(`${API_BASE}/review-text`, { text: pastedText, city })
      }
      startPolling(response.data.job_id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend.')
      setLoading(false)
    }
  }

  const hasResults = result || loading

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-blue-800 to-blue-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                AI Symptom Journal <span className="text-blue-300">MAS</span>
              </h1>
              <p className="text-blue-200 text-xs mt-0.5">Multi-Agent Health Intelligence System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — shown only before any submission */}
      {!hasResults && (
        <div className="bg-gradient-to-b from-blue-700/10 to-transparent py-10 px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-800">Intelligent Health Analysis</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto text-sm">
            Upload your symptom journal and let four AI agents analyse patterns,
            assess risks, and generate a personalised health report.
          </p>
          <div className="flex justify-center gap-8 mt-6">
            {['Symptom Extraction', 'Pattern Detection', 'Risk Assessment', 'Report Generation'].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shadow-sm">
                  {i + 1}
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:block">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <main className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <JournalInput onSubmit={handleSubmit} loading={loading} />
          <Sidebar
            currentAgent={currentAgent}
            status={result?.status || ''}
            risks={result?.risks}
            suggestions={result?.suggestions}
          />
        </div>

        <div className="lg:col-span-2 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!hasResults && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center text-slate-400">
              <svg className="w-14 h-14 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">Results will appear here after analysis</p>
            </div>
          )}

          <FindingsPanel patterns={result?.patterns} weather={result?.weather} symptoms={result?.symptoms} />
          <ActivityLog
            report={result?.report}
            reportPath={result?.report_path}
            medlineLinks={result?.medline_links}
          />
        </div>
      </main>
    </div>
  )
}
