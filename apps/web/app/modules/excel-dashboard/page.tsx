/**
 * 📗 Excel Dashboard Module
 * Butona të thjeshtë për hapjen e Excel dhe Dashboards
 */

"use client"

import Link from 'next/link'

export default function ExcelDashboardPage() {
  
  const openExcel = (filename: string) => {
    // Thirr API për të hapur Excel
    fetch(`/api/open-excel?file=${filename}`)
      .then(() => console.log(`Opening ${filename}`))
      .catch(err => console.error(err))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-green-900 p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Link href="/modules" className="text-green-400 hover:text-green-300 mb-4 inline-block">
          ← Back to Modules
        </Link>
        <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
          <span className="text-6xl">📗</span>
          EXCEL ∞
        </h1>
        <p className="text-xl text-green-300">
          Production-Ready Excel Dashboards
        </p>
      </div>

      {/* Main Excel Files - Big Buttons */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">📊 Excel Files</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => openExcel('Clisonix_Production_Ready.xlsx')}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-2xl p-8 text-left transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
          >
            <div className="text-4xl mb-3">📗</div>
            <div className="text-xl font-bold">Production Ready</div>
            <div className="text-green-200 text-sm mt-2">71 APIs • 19 Kolona • 5 Sheets</div>
            <div className="mt-4 text-xs bg-green-700/50 px-3 py-1 rounded-full inline-block">
              ✅ READY
            </div>
          </button>

          <button 
            onClick={() => openExcel('Clisonix_API_Generator.xlsx')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl p-8 text-left transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            <div className="text-4xl mb-3">🔧</div>
            <div className="text-xl font-bold">API Generator</div>
            <div className="text-blue-200 text-sm mt-2">cURL • Python • =PY() Formulas</div>
            <div className="mt-4 text-xs bg-blue-700/50 px-3 py-1 rounded-full inline-block">
              ✅ READY
            </div>
          </button>

          <button 
            onClick={() => openExcel('Clisonix_Master_Table.xlsx')}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-2xl p-8 text-left transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            <div className="text-4xl mb-3">📋</div>
            <div className="text-xl font-bold">Master Table</div>
            <div className="text-purple-200 text-sm mt-2">Canonical API Reference</div>
            <div className="mt-4 text-xs bg-purple-700/50 px-3 py-1 rounded-full inline-block">
              ✅ READY
            </div>
          </button>

          <button 
            onClick={() => openExcel('Dashboard_Registry.xlsx')}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-2xl p-8 text-left transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            <div className="text-4xl mb-3">📊</div>
            <div className="text-xl font-bold">Dashboard Registry</div>
            <div className="text-orange-200 text-sm mt-2">Functions & Modules</div>
            <div className="mt-4 text-xs bg-orange-700/50 px-3 py-1 rounded-full inline-block">
              ✅ READY
            </div>
          </button>
        </div>

        {/* Dashboards Section */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🖥️ Dashboards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link 
            href="/modules/reporting-dashboard"
            className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white rounded-xl p-6 text-center transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📈</div>
            <div className="font-bold">ULTRA Reporting</div>
            <div className="text-gray-400 text-xs mt-1">Grafana + Prometheus</div>
          </Link>

          <Link 
            href="/modules/industrial-dashboard"
            className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white rounded-xl p-6 text-center transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-2">🏭</div>
            <div className="font-bold">Industrial</div>
            <div className="text-gray-400 text-xs mt-1">System Monitor</div>
          </Link>

          <a 
            href="http://localhost:3001"
            target="_blank"
            className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-white rounded-xl p-6 text-center transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-bold">Grafana</div>
            <div className="text-gray-400 text-xs mt-1">admin / admin</div>
          </a>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => fetch('/api/regenerate-excel')}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all"
          >
            🔄 Regenerate All
          </button>
          
          <button 
            onClick={() => fetch('/api/run-office-scripts')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all"
          >
            ⚡ Run Scripts
          </button>
          
          <Link 
            href="/modules/functions-registry"
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
          >
            ⚙️ Functions Registry
          </Link>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-4 gap-4 text-center">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">71</div>
          <div className="text-xs text-gray-400">APIs</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">4</div>
          <div className="text-xs text-gray-400">Excel Files</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">3</div>
          <div className="text-xs text-gray-400">Scripts</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-400">19</div>
          <div className="text-xs text-gray-400">Columns</div>
        </div>
      </div>
    </div>
  )
}
