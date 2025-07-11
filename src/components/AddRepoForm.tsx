'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface TrackedRepo {
  id: string
  repoName: string
  notifyIssues: boolean
  notifyStars: boolean
  notifyPRs: boolean
  notifyReleases: boolean
  lastCheckedAt: string
  createdAt: string
  lastIssueCount: number
  lastStarCount: number
  lastPRCount: number
  lastReleaseCount: number
}

interface AddRepoFormProps {
  email: string
  onRepoAdded: (repo: TrackedRepo) => void
  onCancel: () => void
}

export default function AddRepoForm({ email, onRepoAdded, onCancel }: AddRepoFormProps) {
  const [repoName, setRepoName] = useState('')
  const [notifyIssues, setNotifyIssues] = useState(true)
  const [notifyStars, setNotifyStars] = useState(true)
  const [notifyPRs, setNotifyPRs] = useState(true)
  const [notifyReleases, setNotifyReleases] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoName: repoName.trim(),
          email,
          notifyIssues,
          notifyStars,
          notifyPRs,
          notifyReleases,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onRepoAdded(data)
        setRepoName('')
      } else {
        setError(data.error || 'Failed to add repository')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add Repository</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="repoName" className="block text-sm font-medium text-gray-700 mb-2">
            Repository Name
          </label>
          <input
            type="text"
            id="repoName"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="owner/repository (e.g., facebook/react)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the repository in the format &quot;owner/repository&quot;
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notification Preferences
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyIssues}
                onChange={(e) => setNotifyIssues(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify about new issues</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyPRs}
                onChange={(e) => setNotifyPRs(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify about new pull requests</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyReleases}
                onChange={(e) => setNotifyReleases(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify about new releases</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifyStars}
                onChange={(e) => setNotifyStars(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify about new stars</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !repoName.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Repository
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
