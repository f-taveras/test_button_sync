// SyncDtoolsButton.tsx
import React, { useState } from 'react'

interface SyncResponse {
  message?: string
  error?: string
  files?: string[]
  stats?: {
    packages: number
    addons: number
    totalItems: number
  }
}

export const SyncDtoolsButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<string>('')
  const [stats, setStats] = useState<{packages: number, addons: number, totalItems: number} | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setMessage('')
    setDetails('')
    setStats(null)

    try {
      const res = await fetch('/api/sync-dtools')
      const data: SyncResponse = await res.json()
      
      if (res.ok) {
        setMessage(data.message || 'Sync completed successfully!')
        if (data.stats) {
          setStats(data.stats)
        }
        if (data.files) {
          setDetails(`Files created: ${data.files.join(', ')}`)
        }
      } else {
        setMessage(data.error || 'Unknown error occurred')
      }
    } catch (err) {
      setMessage('Network error - failed to connect to server')
      setDetails(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Syncing...' : 'Sync Dtools Data'}
      </button>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>{message}</strong>
          
          {stats && (
            <div className="mt-2 text-sm">
              <div>📦 Packages: {stats.packages}</div>
              <div>🎁 Add-ons: {stats.addons}</div>
              <div>📋 Total Items: {stats.totalItems}</div>
            </div>
          )}
          
          {details && (
            <div className="mt-2 text-sm">
              {details}
            </div>
          )}
        </div>
      )}
    </div>
  )
}