export default function ActivityLog({ report, reportPath, medlineLinks }) {

  const downloadPDF = () => {
    if (!report) return
    const win = window.open('', '_blank')
    const filename = reportPath ? reportPath.split(/[/\\]/).pop() : 'health_report.pdf'
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
            h1, h2 { color: #1e40af; }
            pre { white-space: pre-wrap; font-family: inherit; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="margin-bottom:20px;padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">
            Save as PDF
          </button>
          <pre>${report.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="space-y-4">
      {/* MedlinePlus Resources */}
      {medlineLinks && medlineLinks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Health Resources</h2>
          <ul className="space-y-2">
            {medlineLinks.map((link, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-blue-400">→</span>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                  {link.title}
                </a>
                <span className="text-gray-400 capitalize">({link.symptom})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Final Report */}
      {report && (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Health Report</h2>
            <div className="flex items-center gap-3">
              {reportPath && (
                <span className="text-xs text-gray-400 font-mono">{reportPath.split(/[/\\]/).pop()}</span>
              )}
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1.5
                           rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {report}
          </div>
        </div>
      )}
    </div>
  )
}
