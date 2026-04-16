const AGENTS = [
  { id: 'agent1', label: 'Symptom Intake',    model: 'llama3.2:3b'    },
  { id: 'agent2', label: 'Pattern Detection', model: 'deepseek-r1:7b'  },
  { id: 'agent3', label: 'Risk Assessment',   model: 'deepseek-r1:7b'  },
  { id: 'agent4', label: 'Report Writer',     model: 'llama3.2:3b'    },
]

function agentStatus(agentId, currentAgent, status) {
  if (status === 'complete' || currentAgent === 'done') return 'done'
  if (!currentAgent) return 'idle'
  const ids = AGENTS.map(a => a.id)
  const cur  = ids.indexOf(currentAgent)
  const me   = ids.indexOf(agentId)
  if (me < cur)  return 'done'
  if (me === cur) return 'running'
  return 'idle'
}

export default function Sidebar({ currentAgent, status, risks, suggestions }) {
  return (
    <div className="space-y-4">
      {/* Pipeline progress */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Agent Pipeline</h2>
        <div className="space-y-3">
          {AGENTS.map((agent, idx) => {
            const s = agentStatus(agent.id, currentAgent, status)
            return (
              <div key={agent.id} className="flex items-center gap-3">
                {/* Step indicator */}
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500
                    ${s === 'done'    ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${s === 'running' ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : ''}
                    ${s === 'idle'    ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                  `}>
                    {s === 'done' ? '✓' : idx + 1}
                  </div>
                  {idx < AGENTS.length - 1 && (
                    <div className={`absolute left-4 top-9 w-0.5 h-3 ${s === 'done' ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Label */}
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${s === 'running' ? 'text-blue-600' : s === 'done' ? 'text-green-700' : 'text-gray-400'}`}>
                    {agent.label}
                    {s === 'running' && <span className="ml-2 text-xs font-normal animate-pulse">processing...</span>}
                  </p>
                  <p className="text-xs text-gray-400">{agent.model}</p>
                </div>
              </div>
            )
          })}
        </div>

        {status === 'complete' && (
          <div className="mt-4 bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2 font-medium text-center">
            Pipeline complete
          </div>
        )}
      </div>

      {/* Risk Flags */}
      {risks && risks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Risk Flags</h2>
          <div className="space-y-2">
            {risks.filter(r => r.symptom).map((r, i) => {
              const colours = {
                LOW:    'bg-green-100 text-green-700',
                MEDIUM: 'bg-yellow-100 text-yellow-700',
                HIGH:   'bg-orange-100 text-orange-700',
                URGENT: 'bg-red-100 text-red-700',
              }
              return (
                <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded px-3 py-2">
                  <span className="capitalize text-gray-700">{r.symptom}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colours[r.level] || 'bg-gray-100'}`}>
                    {r.level}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lifestyle Tips */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Lifestyle Tips</h2>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
