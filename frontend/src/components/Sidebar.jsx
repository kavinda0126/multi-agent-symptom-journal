const AGENTS = [
  { id: 'agent1', label: 'Agent 1 — Symptom Intake',    model: 'llama3.2:3b',      owner: 'Kavinda'  },
  { id: 'agent2', label: 'Agent 2 — Pattern Detection', model: 'deepseek-r1:7b',   owner: 'Rachith'  },
  { id: 'agent3', label: 'Agent 3 — Risk Assessment',   model: 'deepseek-r1:7b',   owner: 'Tharindu' },
  { id: 'agent4', label: 'Agent 4 — Report Writer',     model: 'llama3.2:3b',      owner: 'Githadi'  },
]

function statusFor(agentId, currentAgent, status) {
  const ids = ['agent1', 'agent2', 'agent3', 'agent4']
  const currentIdx = ids.indexOf(currentAgent)
  const thisIdx    = ids.indexOf(agentId)

  if (status === 'complete') return 'done'
  if (!currentAgent)         return 'idle'
  if (thisIdx < currentIdx)  return 'done'
  if (thisIdx === currentIdx) return 'running'
  return 'idle'
}

const STATUS_STYLES = {
  idle:    'bg-gray-100 text-gray-400',
  running: 'bg-yellow-100 text-yellow-700 animate-pulse',
  done:    'bg-green-100 text-green-700',
}

const STATUS_LABELS = {
  idle:    'Waiting',
  running: 'Running...',
  done:    'Complete',
}

export default function Sidebar({ currentAgent, status, risks, suggestions }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Agent Pipeline</h2>
        <div className="space-y-2">
          {AGENTS.map((agent) => {
            const s = statusFor(agent.id, currentAgent, status)
            return (
              <div key={agent.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${STATUS_STYLES[s]}`}>
                  {STATUS_LABELS[s]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{agent.label}</p>
                  <p className="text-xs text-gray-400">{agent.model} · {agent.owner}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {risks && risks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Risk Flags</h2>
          <div className="space-y-2">
            {risks.map((r, i) => {
              const colours = {
                LOW: 'bg-green-100 text-green-700',
                MEDIUM: 'bg-yellow-100 text-yellow-700',
                HIGH: 'bg-orange-100 text-orange-700',
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

      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Lifestyle Tips</h2>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
