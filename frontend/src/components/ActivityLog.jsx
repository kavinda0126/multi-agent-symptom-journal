function cleanLine(line) {
  return line
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/\\\(.*?\\\)/g, '')           // remove LaTeX inline math \( ... \)
    .replace(/\$.*?\$/g, '')               // remove LaTeX $...$ math
    .replace(/^#{1,6}\s+/g, '')            // remove leading # headings
    .replace(/^-{2,}$/g, '')               // remove --- dividers
    .replace(/\*\*(.*?)\*\*/g, '$1')       // strip bold
    .replace(/\*(.*?)\*/g, '$1')           // strip italic
    .replace(/`/g, '')                     // strip code ticks
    .trim()
}

function renderReport(text) {
  if (!text) return null

  // Split on ## or #### section headers
  const sections = text.split(/\n(?=#{1,4} )/)

  return sections.map((section, i) => {
    const lines   = section.split('\n')
    const rawHead = lines[0]
    const heading = rawHead.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').trim()
    const body    = lines.slice(1).join('\n').trim()

    // Filter out pure divider lines and empty lines
    const items = body.split('\n').filter(l => {
      const t = l.trim()
      return t && !/^-{2,}$/.test(t) && !/^#{1,6}\s/.test(t)
    })

    if (!heading && items.length === 0) return null

    return (
      <div key={i} className={`${i < sections.length - 1 ? 'pb-5 mb-5 border-b border-slate-100' : ''}`}>
        {heading && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{heading}</h3>
          </div>
        )}
        <div className="space-y-1.5">
          {items.map((line, j) => {
            const isBullet = /^[\-*•]\s/.test(line.trim())
            const clean    = cleanLine(line.replace(/^[\-*•]\s*/, ''))
            if (!clean) return null
            return (
              <p key={j} className={`text-sm text-slate-600 leading-relaxed ${isBullet ? 'flex gap-2.5 items-start' : ''}`}>
                {isBullet && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                )}
                <span>{clean}</span>
              </p>
            )
          })}
        </div>
      </div>
    )
  })
}

export default function ActivityLog({ report, reportPath, medlineLinks }) {

  const toHtml = (text) => {
    const lines = text.split('\n')
    let html = ''
    let inList = false

    for (let raw of lines) {
      let line = raw
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/\\\(.*?\\\)/g, '')
        .replace(/\$.*?\$/g, '')
        // clean raw Python dict symptom entries e.g. {'name': 'X', 'severity': 7}
        .replace(/\{'name':\s*'([^']+)',\s*'severity':\s*(\d+)\}/g, '$1 (severity $2)')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .trim()

      if (!line || /^-{2,}$/.test(line)) {
        if (inList) { html += '</ul>'; inList = false }
        continue
      }

      if (/^#{1,2}\s/.test(line)) {
        if (inList) { html += '</ul>'; inList = false }
        html += `<h2>${line.replace(/^#{1,2}\s+/, '')}</h2>`
      } else if (/^#{3,6}\s/.test(line)) {
        if (inList) { html += '</ul>'; inList = false }
        html += `<h3>${line.replace(/^#{3,6}\s+/, '')}</h3>`
      } else if (/^[\*\-]\s/.test(line)) {
        if (!inList) { html += '<ul>'; inList = true }
        html += `<li>${line.replace(/^[\*\-]\s+/, '')}</li>`
      } else {
        if (inList) { html += '</ul>'; inList = false }
        html += `<p>${line}</p>`
      }
    }
    if (inList) html += '</ul>'
    return html
  }

  const downloadPDF = () => {
    if (!report) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Health Report</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; max-width: 780px; margin: 40px auto; padding: 0 28px; color: #1a1a1a; line-height: 1.75; font-size: 14px; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
          .header img { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }
          .header h1 { margin: 0; font-size: 22px; color: #1e3a8a; }
          .header p { margin: 3px 0 0; font-size: 12px; color: #6b7280; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
          h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1d4ed8; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
          h3 { font-size: 13px; font-weight: 600; color: #374151; margin: 16px 0 6px; }
          p { margin: 4px 0 8px; color: #374151; }
          ul { margin: 4px 0 12px 20px; padding: 0; }
          li { margin: 4px 0; color: #374151; }
          strong { color: #111827; }
          button { margin-bottom: 24px; padding: 8px 18px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Save as PDF</button>
        <div class="header">
          <img src="/logo.jpg" alt="logo"/>
          <div>
            <h1>AI Health Intelligence Report</h1>
            <p>Generated by Multi-Agent Symptom Journal System</p>
          </div>
        </div>
        <hr/>
        ${toHtml(report)}
      </body></html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="space-y-4">
      {/* Health Resources */}
      {medlineLinks && medlineLinks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Health Resources</h2>
          </div>
          <ul className="p-4 space-y-2">
            {medlineLinks.map((link, i) => (
              <li key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-teal-50 transition-colors group">
                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                  <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <a href={link.url} target="_blank" rel="noreferrer"
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium hover:underline flex-1 truncate">
                  {link.title}
                </a>
                <span className="text-xs text-slate-400 capitalize flex-shrink-0 bg-white rounded-full px-2 py-0.5 ring-1 ring-slate-200">
                  {link.symptom}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Health Report</h2>
                {reportPath && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{reportPath.split(/[/\\]/).pop()}</p>
                )}
              </div>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600
                         text-white text-xs px-3.5 py-2 rounded-xl font-semibold shadow-sm shadow-blue-200
                         hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>

          <div className="p-5 max-h-[600px] overflow-y-auto">
            <div className="bg-slate-50 rounded-xl p-5">
              {renderReport(report)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
