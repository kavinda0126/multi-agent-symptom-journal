export default function FindingsPanel({ patterns, weather, symptoms }) {
  if (!patterns || Object.keys(patterns).length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Patterns & Weather</h2>
        <p className="text-gray-400 text-sm">No patterns detected yet.</p>
      </div>
    )
  }

  const sortedPatterns = Object.entries(patterns).sort((a, b) => b[1] - a[1])
  const weatherAnalysis = weather?.llm_analysis || ''
  const hasThinking = weatherAnalysis.includes('<think>')
  const cleanAnalysis = weatherAnalysis.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Patterns & Weather Correlations</h2>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
          Symptom Frequency
        </h3>
        <div className="space-y-2">
          {sortedPatterns.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-40 text-sm text-gray-700 capitalize">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${Math.min((count / sortedPatterns[0][1]) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 w-8">{count}x</span>
            </div>
          ))}
        </div>
      </div>

      {symptoms && symptoms.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Symptom Timeline
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {symptoms.map((s, i) => (
              <div key={i} className="flex justify-between text-sm bg-gray-50 rounded px-3 py-1">
                <span className="capitalize text-gray-700">{s.symptom_name}</span>
                <span className="text-gray-500">{s.date || s.time_of_day}</span>
                <span className="font-medium text-blue-600">Sev {s.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cleanAnalysis && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Weather Correlation Analysis
            {hasThinking && <span className="ml-2 text-xs text-purple-500">(deepseek-r1 reasoning)</span>}
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50 rounded-lg p-3">
            {cleanAnalysis}
          </p>
        </div>
      )}
    </div>
  )
}
