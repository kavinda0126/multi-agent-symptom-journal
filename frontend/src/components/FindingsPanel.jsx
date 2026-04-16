// Parse symptom name from raw dict strings like {'Name': 'Cephalalgia', 'Severity': 7}
function parseSymptomName(raw) {
  if (!raw) return 'Unknown'
  if (typeof raw === 'string') {
    const m = raw.match(/['"](?:name|Name|symptom_name)['"]:\s*['"]([^'"]+)['"]/i)
    if (m) return m[1]
    if (raw.startsWith('{')) return raw.replace(/[{}'"]/g, '').replace(/\w+:/g, '').trim() || 'Unknown'
    return raw
  }
  if (typeof raw === 'object') return raw.name || raw.symptom_name || 'Unknown'
  return String(raw)
}

function stripMarkdown(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')  // remove think blocks
    .replace(/\\\([\s\S]*?\\\)/g, '')           // remove LaTeX \( ... \)
    .replace(/\$[\s\S]*?\$/g, '')               // remove LaTeX $...$
    .replace(/\*\*(.*?)\*\*/g, '$1')            // strip bold
    .replace(/\*(.*?)\*/g, '$1')                // strip italic
    .replace(/#{1,6}\s+/gm, '')                 // strip headings
    .replace(/^-{2,}$/gm, '')                   // strip --- dividers
    .replace(/`/g, '')                          // strip code ticks
    .replace(/^\s*[-*]\s+/gm, '• ')             // normalise bullets
    .replace(/^\s*\d+\.\s+/gm, '')              // strip numbered lists
    .replace(/\n{3,}/g, '\n\n')                 // collapse excess blank lines
    .trim()
}

const SYMPTOM_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-blue-500',
  'from-teal-500 to-emerald-500',
  'from-sky-500 to-cyan-500',
]

export default function FindingsPanel({ patterns, weather, symptoms }) {
  if (!patterns || Object.keys(patterns).length === 0) return null

  // Deduplicate by parsed name — merge counts for same symptom
  const merged = {}
  for (const [raw, count] of Object.entries(patterns)) {
    const name = parseSymptomName(raw).toLowerCase()
    if (!name || name === 'unknown') continue
    merged[name] = (merged[name] || 0) + count
  }
  const sortedPatterns = Object.entries(merged).sort((a, b) => b[1] - a[1])
  const maxCount       = sortedPatterns[0]?.[1] || 1
  const rawAnalysis    = weather?.llm_analysis || ''
  const cleanAnalysis  = stripMarkdown(rawAnalysis)

  return (
    <div className="space-y-4">
      {/* Patterns + Timeline row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Frequency chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-800">Symptom Frequency</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{sortedPatterns.length} unique</span>
          </div>
          <div className="p-5 space-y-3">
            {sortedPatterns.slice(0, 6).map(([name, count], i) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-600 capitalize truncate max-w-[60%]">{name}</span>
                  <span className="text-xs font-bold text-slate-500">{count}x</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${SYMPTOM_COLORS[i % SYMPTOM_COLORS.length]} transition-all duration-700`}
                    style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {symptoms && symptoms.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800">Symptom Timeline</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {symptoms.filter(s => { const n = parseSymptomName(s.symptom_name).toLowerCase(); return n && n !== 'unknown' && n !== 'none' }).length} entries
              </span>
            </div>
            <div className="p-3 max-h-56 overflow-y-auto space-y-1.5">
              {symptoms.filter(s => {
                const n = parseSymptomName(s.symptom_name).toLowerCase()
                return n && n !== 'unknown' && n !== 'none'
              }).map((s, i) => {
                const sev = parseInt(s.severity) || 0
                const sevColor = sev >= 8 ? 'text-red-600 bg-red-50' :
                                 sev >= 5 ? 'text-orange-600 bg-orange-50' :
                                            'text-emerald-600 bg-emerald-50'
                return (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-lg min-w-[2.5rem] text-center ${sevColor}`}>
                      {s.severity}
                    </div>
                    <span className="text-xs text-slate-700 capitalize flex-1 truncate">{parseSymptomName(s.symptom_name)}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">{s.date || s.time_of_day || ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Weather correlation */}
      {cleanAnalysis && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Weather Correlation</h3>
          </div>
          <div className="p-5">
            <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-sky-100">
              {cleanAnalysis}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
