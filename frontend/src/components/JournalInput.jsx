import { useState, useRef } from 'react'

const SAMPLE_JOURNALS = [
  {
    label: 'Migraine & Fatigue (7 days)',
    city: 'Colombo',
    text: `Day 1 - Monday April 7:
Headache severity 7, started at 2pm, lasted 3 hours
Fatigue severity 5, all day

Day 2 - Tuesday April 8:
No symptoms

Day 3 - Wednesday April 9:
Headache severity 8, started at 3pm, lasted 2 hours
Nausea severity 4, evening

Day 4 - Thursday April 10:
Fatigue severity 6, morning and afternoon
Back pain severity 4, all day

Day 5 - Friday April 11:
Headache severity 6, started at 2pm
Fatigue severity 4, morning

Day 6 - Saturday April 12:
No symptoms

Day 7 - Sunday April 13:
Headache severity 5, afternoon
Dizziness severity 3, morning`,
  },
  {
    label: 'Respiratory & Chest (5 days)',
    city: 'Kandy',
    text: `Day 1 - Monday:
Cough severity 5, all day
Sore throat severity 4, morning and evening
Fatigue severity 6, all day

Day 2 - Tuesday:
Cough severity 7, worse at night
Chest tightness severity 5, morning
Shortness of breath severity 4, during activity
Fatigue severity 7, all day

Day 3 - Wednesday:
Cough severity 6, all day
Fever severity 6, started at noon, lasted 4 hours
Body aches severity 5, all day

Day 4 - Thursday:
Cough severity 4, improving
Chest tightness severity 3, morning only
Fatigue severity 5, all day

Day 5 - Friday:
Cough severity 3, mild
Fatigue severity 3, improving
Sore throat severity 2, mild`,
  },
  {
    label: 'Digestive Issues (6 days)',
    city: 'Galle',
    text: `Day 1 - Monday:
Nausea severity 6, morning
Stomach pain severity 5, after meals
Loss of appetite severity 4, all day

Day 2 - Tuesday:
Nausea severity 7, morning and afternoon
Vomiting severity 5, twice in morning
Stomach pain severity 6, all day
Fatigue severity 5, all day

Day 3 - Wednesday:
Nausea severity 4, morning
Stomach pain severity 4, after meals
Headache severity 3, afternoon
Fatigue severity 4, all day

Day 4 - Thursday:
Stomach pain severity 3, mild
Bloating severity 4, after meals
Fatigue severity 3, afternoon

Day 5 - Friday:
Bloating severity 3, mild
No other symptoms

Day 6 - Saturday:
Stomach pain severity 2, mild
Feeling much better overall`,
  },
  {
    label: 'Stress & Sleep Disorder (5 days)',
    city: 'Colombo',
    text: `Day 1 - Monday:
Headache severity 5, evening
Insomnia severity 6, could not sleep until 3am
Anxiety severity 5, evening and night

Day 2 - Tuesday:
Fatigue severity 7, all day due to poor sleep
Headache severity 4, afternoon
Difficulty concentrating severity 6, all day
Anxiety severity 4, afternoon

Day 3 - Wednesday:
Insomnia severity 5, slept only 4 hours
Fatigue severity 6, all day
Neck pain severity 4, from tension
Headache severity 5, morning

Day 4 - Thursday:
Fatigue severity 5, morning
Headache severity 3, mild
Difficulty concentrating severity 4, morning

Day 5 - Friday:
Fatigue severity 4, improving
Headache severity 2, mild
Sleep slightly better, 6 hours`,
  },
]

export default function JournalInput({ onSubmit, loading }) {
  const [tab, setTab]               = useState('file')
  const [file, setFile]             = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [city, setCity]             = useState('Colombo')
  const [dragging, setDragging]     = useState(false)
  const [sample, setSample]         = useState('')
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

  const handleSampleSelect = (e) => {
    const idx = e.target.value
    setSample(idx)
    if (idx === '') return
    const s = SAMPLE_JOURNALS[parseInt(idx)]
    setPastedText(s.text)
    setCity(s.city)
    setTab('text')
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

      <div className="p-6 space-y-4">

        {/* Sample journal dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Try a Sample Journal
          </label>
          <div className="relative">
            <svg className="w-4 h-4 text-violet-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <select
              value={sample}
              onChange={handleSampleSelect}
              className="w-full border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                         bg-slate-50 appearance-none cursor-pointer transition"
            >
              <option value="">— Select a demo journal —</option>
              {SAMPLE_JOURNALS.map((s, i) => (
                <option key={i} value={i}>{s.label}</option>
              ))}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or use your own</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

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
                onChange={(e) => { setPastedText(e.target.value); setSample('') }}
                rows={8}
                placeholder={"Day 1 - Monday:\nHeadache severity 7, started at 2pm\nFatigue severity 5, all day\n\nDay 2 - Tuesday:\n..."}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           font-mono resize-none bg-slate-50 placeholder-slate-300 transition"
              />
              {pastedText && (
                <button
                  type="button"
                  onClick={() => { setPastedText(''); setSample('') }}
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
