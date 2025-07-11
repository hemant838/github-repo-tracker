'use client'

import { useState } from 'react'
import { Star, GitPullRequest, AlertCircle, Rocket, Settings, Trash2, ExternalLink } from 'lucide-react'
import { getTimeSince } from '@/lib/utils'

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

interface RepoCardProps {
  repo: TrackedRepo
  email: string
  onRepoRemoved: (repoId: string) => void
  onRepoUpdated: (repo: TrackedRepo) => void
}

export default function RepoCard({ repo, email, onRepoRemoved, onRepoUpdated }: RepoCardProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifyIssues, setNotifyIssues] = useState(repo.notifyIssues)
  const [notifyStars, setNotifyStars] = useState(repo.notifyStars)
  const [notifyPRs, setNotifyPRs] = useState(repo.notifyPRs)
  const [notifyReleases, setNotifyReleases] = useState(repo.notifyReleases)

  const handleUpdateSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/repos/${repo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          notifyIssues,
          notifyStars,
          notifyPRs,
          notifyReleases,
        }),
      })

      if (response.ok) {
        const updatedRepo = await response.json()
        onRepoUpdated(updatedRepo)
        setShowSettings(false)
      }
    } catch (error) {
      console.error('Error updating repository settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRepo = async () => {
    if (!confirm(`Are you sure you want to stop tracking ${repo.repoName}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/repos/${repo.id}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRepoRemoved(repo.id)
      }
    } catch (error) {
      console.error('Error removing repository:', error)
    } finally {
      setLoading(false)
    }
  }

  const repoUrl = `https://github.com/${repo.repoName}`

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{repo.repoName}</h3>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-sm text-gray-600">
            Added {getTimeSince(repo.createdAt)} • Last checked {getTimeSince(repo.lastCheckedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleRemoveRepo}
            disabled={loading}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-600">{repo.lastStarCount} stars</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-gray-600">{repo.lastIssueCount} issues</span>
        </div>
        <div className="flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">{repo.lastPRCount} PRs</span>
        </div>
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">{repo.lastReleaseCount} releases</span>
        </div>
      </div>

      {/* Notification Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {repo.notifyIssues && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Issues
          </span>
        )}
        {repo.notifyPRs && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pull Requests
          </span>
        )}
        {repo.notifyReleases && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Releases
          </span>
        )}
        {repo.notifyStars && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Stars
          </span>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h4>
          <div className="space-y-2 mb-4">
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
          <div className="flex gap-2">
            <button
              onClick={handleUpdateSettings}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
