import { useState, useRef } from 'react'

export default function JournalInput({ onSubmit, loading }) {
  const [tab, setTab]               = useState('file')
  const [file, setFile]             = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [city, setCity]             = useState('Colombo')
  const [dragging, setDragging]     = useState(false)
  const fileInputRef                = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (tab === 'file' && !file) return
    if (tab === 'text' && !pastedText.trim()) return
    onSubmit(tab === 'file' ? file : null, city, tab === 'text' ? pastedText : null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.txt')) setFile(dropped)
  }

  const canSubmit = !loading && (tab === 'file' ? !!file : !!pastedText.trim())

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-slate-800">Symptom Journal</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {[
            { key: 'file', label: 'Upload File', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
            { key: 'text', label: 'Paste Text',  icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                ${tab === t.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                ${dragging
                  ? 'border-blue-400 bg-blue-50'
                  : file
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <>
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Click to change file</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Drop your <span className="text-blue-600">.txt</span> file here</p>
                  <p className="text-xs text-slate-400 mt-0.5">or click to browse</p>
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                placeholder={"Day 1 - Monday:\nHeadache severity 7, started at 2pm\nFatigue severity 5, all day\n\nDay 2 - Tuesday:\n..."}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           font-mono resize-none bg-slate-50 placeholder-slate-300 transition"
              />
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* City input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              City for Weather Data
            </label>
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Colombo"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-slate-50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4
                       rounded-xl font-semibold text-sm shadow-md shadow-blue-200
                       hover:from-blue-700 hover:to-indigo-700
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Analysing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyse Journal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
