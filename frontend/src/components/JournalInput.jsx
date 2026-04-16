import { useState } from 'react'

export default function JournalInput({ onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [city, setCity] = useState('Colombo')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return
    onSubmit(file, city)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Symptom Journal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Journal File (.txt)
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your City (for weather data)
          </label>
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
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {loading ? 'Analysing...' : 'Analyse Journal'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
        <p className="font-medium mb-1">Sample journal format:</p>
        <pre className="whitespace-pre-wrap">
{`Day 1 - Monday:
Headache severity 7, started at 2pm
Fatigue severity 5, all day`}
        </pre>
      </div>
    </div>
  )
}
