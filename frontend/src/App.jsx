import { useState } from 'react'
import axios from 'axios'
import JournalInput  from './components/JournalInput'
import FindingsPanel from './components/FindingsPanel'
import Sidebar       from './components/Sidebar'
import ActivityLog   from './components/ActivityLog'

const API_BASE = 'http://localhost:8000'

export default function App() {
  const [loading, setLoading]       = useState(false)
  const [result,  setResult]        = useState(null)
  const [error,   setError]         = useState(null)

  async function handleSubmit(file, city) {
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${API_BASE}/review?city=${encodeURIComponent(city)}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Symptom Journal <span className="text-blue-600">MAS</span>
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Multi-Agent Health Intelligence System — SE4010 CTSE Assignment 2
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <JournalInput onSubmit={handleSubmit} loading={loading} />
          <Sidebar
            currentAgent={result?.current_agent || (loading ? 'agent1' : '')}
            status={result?.status || ''}
            risks={result?.risks}
            suggestions={result?.suggestions}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-4 text-sm flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Pipeline running — 4 agents processing your journal...
            </div>
          )}

          <FindingsPanel
            patterns={result?.patterns}
            weather={result?.weather}
            symptoms={result?.symptoms}
          />

          <ActivityLog
            logs={result?.logs}
            report={result?.report}
            reportPath={result?.report_path}
            medlineLinks={result?.medline_links}
          />
        </div>
      </main>
    </div>
  )
}
