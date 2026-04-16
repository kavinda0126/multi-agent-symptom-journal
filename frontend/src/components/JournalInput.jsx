import { useState } from 'react'

export default function JournalInput({ onSubmit, loading }) {
  const [tab, setTab]             = useState('file')
  const [file, setFile]           = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [city, setCity]           = useState('Colombo')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (tab === 'file' && !file) return
    if (tab === 'text' && !pastedText.trim()) return
    onSubmit(tab === 'file' ? file : null, city, tab === 'text' ? pastedText : null)
  }

  const canSubmit = !loading && (tab === 'file' ? !!file : !!pastedText.trim())

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Symptom Journal</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {['file', 'text'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'file' ? 'Upload File' : 'Paste Text'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'file' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Journal File (.txt)</label>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <p className="text-xs text-gray-400 mt-1">Selected: {file.name}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste your journal</label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              placeholder={"Day 1 - Monday:\nHeadache severity 7, started at 2pm\nFatigue severity 5, all day"}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City (for weather data)</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Colombo"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analysing...' : 'Analyse Journal'}
        </button>
      </form>
    </div>
  )
}
