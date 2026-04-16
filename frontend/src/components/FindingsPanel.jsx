function stripMarkdown(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`/g, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function FindingsPanel({ patterns, weather, symptoms }) {
  if (!patterns || Object.keys(patterns).length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Patterns & Weather</h2>
        <p className="text-gray-400 text-sm">No patterns detected yet.</p>
      </div>
    )
  }

  const sortedPatterns  = Object.entries(patterns).filter(([k]) => k).sort((a, b) => b[1] - a[1])
  const rawAnalysis     = weather?.llm_analysis || ''
  const cleanAnalysis   = stripMarkdown(rawAnalysis)

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Patterns & Weather Correlations</h2>

      {/* Symptom frequency bars */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Symptom Frequency</h3>
        <div className="space-y-2">
          {sortedPatterns.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-36 text-sm text-gray-700 capitalize truncate">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((count / sortedPatterns[0][1]) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 w-6 text-right">{count}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Symptom timeline */}
      {symptoms && symptoms.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Symptom Timeline</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {symptoms.map((s, i) => (
              <div key={i} className="flex justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
                <span className="capitalize text-gray-700">{s.symptom_name}</span>
                <span className="text-gray-400">{s.date || s.time_of_day || ''}</span>
                <span className="font-medium text-blue-600">Severity {s.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather correlation — plain text */}
      {cleanAnalysis && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Weather Correlation</h3>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {cleanAnalysis}
          </div>
        </div>
      )}
    </div>
  )
}
