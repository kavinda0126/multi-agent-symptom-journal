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
      } catch (err) {
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
          <Sidebar currentAgent={currentAgent} status={result?.status || ''} risks={result?.risks} suggestions={result?.suggestions} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
              {error}
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
