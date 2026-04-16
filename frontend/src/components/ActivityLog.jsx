import { useEffect, useRef } from 'react'

const EVENT_COLOURS = {
  start:     'text-blue-600',
  tool_call: 'text-purple-600',
  api_call:  'text-teal-600',
  llm_call:  'text-orange-500',
  output:    'text-green-600',
  error:     'text-red-600',
}

export default function ActivityLog({ logs, report, reportPath, medlineLinks }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Agent Activity Log</h2>
        {logs && logs.length > 0 ? (
          <div className="max-h-64 overflow-y-auto font-mono text-xs space-y-1 bg-gray-950 rounded-lg p-3">
            {logs.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-500 shrink-0">
                  {entry.timestamp ? entry.timestamp.slice(11, 19) : '--:--:--'}
                </span>
                <span className="text-gray-400 shrink-0 w-14">[{entry.agent}]</span>
                <span className={`shrink-0 w-16 ${EVENT_COLOURS[entry.event] || 'text-gray-300'}`}>
                  {entry.event}
                </span>
                <span className="text-gray-300 truncate">
                  {JSON.stringify(entry.data)}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <p className="text-sm text-gray-400 font-mono bg-gray-950 rounded-lg p-3">
            Waiting for pipeline to start...
          </p>
        )}
      </div>

      {medlineLinks && medlineLinks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">MedlinePlus Resources</h2>
          <ul className="space-y-2">
            {medlineLinks.map((link, i) => (
              <li key={i} className="text-sm">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {link.title}
                </a>
                <span className="text-gray-400 ml-2 capitalize">({link.symptom})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Final Health Report</h2>
            {reportPath && (
              <span className="text-xs text-gray-400 font-mono">{reportPath.split(/[/\\]/).pop()}</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {report}
          </div>
        </div>
      )}
    </div>
  )
}
