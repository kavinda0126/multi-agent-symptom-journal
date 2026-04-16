const AGENTS = [
  {
    id: 'agent1', label: 'Symptom Intake', model: 'llama3.2:3b',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    id: 'agent2', label: 'Pattern Detection', model: 'deepseek-r1:7b',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 'agent3', label: 'Risk Assessment', model: 'deepseek-r1:7b',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    id: 'agent4', label: 'Report Writer', model: 'llama3.2:3b',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

function agentStatus(agentId, currentAgent, status) {
  if (status === 'complete') return 'done'
  if (!currentAgent) return 'idle'
  const ids = AGENTS.map(a => a.id)
  const cur = ids.indexOf(currentAgent)
  if (cur === -1) return 'idle'   // handles 'done' mid-flight gracefully
  const me = ids.indexOf(agentId)
  if (me < cur)   return 'done'
  if (me === cur) return 'running'
  return 'idle'
}

const RISK_STYLES = {
  LOW:    { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-400', bar: 'bg-emerald-100', fill: 'bg-emerald-400' },
  MEDIUM: { badge: 'bg-amber-50 text-amber-700 ring-amber-200',       dot: 'bg-amber-400',   bar: 'bg-amber-100',   fill: 'bg-amber-400'   },
  HIGH:   { badge: 'bg-orange-50 text-orange-700 ring-orange-200',    dot: 'bg-orange-500',  bar: 'bg-orange-100',  fill: 'bg-orange-500'  },
  URGENT: { badge: 'bg-red-50 text-red-700 ring-red-200',             dot: 'bg-red-500',     bar: 'bg-red-100',     fill: 'bg-red-500'     },
}

const LEVEL_ORDER = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
const LEVEL_WIDTH  = { LOW: '25%', MEDIUM: '50%', HIGH: '75%', URGENT: '100%' }

// Extract symptom name from raw dict strings like {'Name': 'Cephalalgia', 'Severity': 7}
function parseSymptomName(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') {
    const m = raw.match(/['"](?:name|Name|symptom_name)['"]:\s*['"]([^'"]+)['"]/i)
    if (m) return m[1]
    // strip any remaining dict-like chars
    return raw.replace(/[{}'"]/g, '').replace(/\w+:/g, '').trim()
  }
  if (typeof raw === 'object') return raw.name || raw.symptom_name || String(raw)
  return String(raw)
}

export default function Sidebar({ currentAgent, status, risks, suggestions }) {
  return (
    <div className="space-y-4">
      {/* Pipeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-slate-800">Agent Pipeline</h2>
        </div>

        <div className="p-5 space-y-1">
          {AGENTS.map((agent, idx) => {
            const s = agentStatus(agent.id, currentAgent, status)
            return (
              <div key={agent.id}>
                <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300
                  ${s === 'running' ? 'bg-blue-50' : s === 'done' ? 'bg-emerald-50/60' : ''}`}>

                  {/* Icon circle */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500
                    ${s === 'done'    ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : ''}
                    ${s === 'running' ? 'bg-blue-500 shadow-sm shadow-blue-200 animate-pulse' : ''}
                    ${s === 'idle'    ? 'bg-slate-100' : ''}`}>
                    {s === 'done' ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 ${s === 'running' ? 'text-white' : 'text-slate-400'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={agent.icon} />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold leading-tight
                      ${s === 'running' ? 'text-blue-700' : s === 'done' ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {agent.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${s === 'idle' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {agent.model}
                    </p>
                  </div>

                  {s === 'running' && (
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1 h-1 rounded-full bg-blue-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                  {s === 'done' && (
                    <span className="text-xs text-emerald-500 font-medium">Done</span>
                  )}
                </div>

                {idx < AGENTS.length - 1 && (
                  <div className={`ml-7 w-0.5 h-3 rounded-full transition-colors duration-500
                    ${s === 'done' ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                )}
              </div>
            )
          })}
        </div>

        {status === 'complete' && (
          <div className="mx-5 mb-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm
                          rounded-xl px-4 py-2.5 font-semibold text-center shadow-sm shadow-emerald-200
                          flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Analysis Complete
          </div>
        )}
      </div>

      {/* Risk Flags */}
      {risks && risks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-800">Risk Flags</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">{risks.filter(r => r.symptom).length} detected</span>
          </div>
          <div className="p-4 space-y-3">
            {risks.filter(r => r.symptom).map((r, i) => {
              const style  = RISK_STYLES[r.level] || RISK_STYLES.MEDIUM
              const name   = parseSymptomName(r.symptom)
              const width  = LEVEL_WIDTH[r.level] || '50%'
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                      <span className="text-sm font-medium text-slate-700 capitalize">{name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ring-1 ${style.badge}`}>
                      {r.level}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full ${style.bar}`}>
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${style.fill}`}
                      style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Lifestyle Tips */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Lifestyle Tips</h2>
          </div>
          <ul className="p-4 space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-600 bg-teal-50/60 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
