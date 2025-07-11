'use client'

import { useState, useEffect } from 'react'
import { Plus, Github, Star, AlertCircle, Rocket } from 'lucide-react'
import AddRepoForm from './AddRepoForm'
import RepoCard from './RepoCard'
import StatusCard from './StatusCard'

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

interface PollingStatus {
  totalRepos: number
  lastPolled: string | null
  nextPoll: string | null
  isHealthy: boolean
}

export default function Dashboard() {
  const [email, setEmail] = useState('')
  const [trackedRepos, setTrackedRepos] = useState<TrackedRepo[]>([])
  const [pollingStatus, setPollingStatus] = useState<PollingStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Load email from localStorage
    const savedEmail = localStorage.getItem('userEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      fetchTrackedRepos(savedEmail)
    }
    
    fetchPollingStatus()
  }, [])

  const fetchTrackedRepos = async (userEmail: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/repos?email=${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const repos = await response.json()
        setTrackedRepos(repos)
      }
    } catch (error) {
      console.error('Error fetching tracked repos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPollingStatus = async () => {
    try {
      const response = await fetch('/api/status')
      if (response.ok) {
        const status = await response.json()
        setPollingStatus(status)
      }
    } catch (error) {
      console.error('Error fetching polling status:', error)
    }
  }

  const handleEmailSubmit = (userEmail: string) => {
    setEmail(userEmail)
    localStorage.setItem('userEmail', userEmail)
    fetchTrackedRepos(userEmail)
  }

  const handleRepoAdded = (newRepo: TrackedRepo) => {
    setTrackedRepos(prev => [newRepo, ...prev])
    setShowAddForm(false)
  }

  const handleRepoRemoved = (repoId: string) => {
    setTrackedRepos(prev => prev.filter(repo => repo.id !== repoId))
  }

  const handleRepoUpdated = (updatedRepo: TrackedRepo) => {
    setTrackedRepos(prev => 
      prev.map(repo => repo.id === updatedRepo.id ? updatedRepo : repo)
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Github className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              GitHub Repo Tracker
            </h1>
            <p className="text-gray-600">
              Track your favorite repositories and get notified of new activity
            </p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const userEmail = formData.get('email') as string
            if (userEmail) {
              handleEmailSubmit(userEmail)
            }
          }}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Get Started
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Github className="h-8 w-8" />
                GitHub Repo Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Tracking repositories for {email}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('userEmail')
                setEmail('')
                setTrackedRepos([])
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Tracked Repos"
            value={trackedRepos.length}
            icon={<Github className="h-5 w-5" />}
            color="blue"
          />
          <StatusCard
            title="Total Stars"
            value={trackedRepos.reduce((sum, repo) => sum + repo.lastStarCount, 0)}
            icon={<Star className="h-5 w-5" />}
            color="yellow"
          />
          <StatusCard
            title="Open Issues"
            value={trackedRepos.reduce((sum, repo) => sum + repo.lastIssueCount, 0)}
            icon={<AlertCircle className="h-5 w-5" />}
            color="red"
          />
          <StatusCard
            title="System Status"
            value={pollingStatus?.isHealthy ? "Healthy" : "Error"}
            icon={<Rocket className="h-5 w-5" />}
            color={pollingStatus?.isHealthy ? "green" : "red"}
          />
        </div>

        {/* Add Repository Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Repository
          </button>
        </div>

        {/* Add Repository Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddRepoForm
              email={email}
              onRepoAdded={handleRepoAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Repository List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading repositories...</p>
            </div>
          ) : trackedRepos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Github className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No repositories tracked yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first repository to start tracking GitHub activity
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Repository
              </button>
            </div>
          ) : (
            trackedRepos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                email={email}
                onRepoRemoved={handleRepoRemoved}
                onRepoUpdated={handleRepoUpdated}
              />
            ))
          )}
        </div>

        {/* Polling Status */}
        {pollingStatus && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Polling Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Last Polled:</span>
                <p className="font-medium text-gray-600">
                  {pollingStatus.lastPolled 
                    ? new Date(pollingStatus.lastPolled).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">Next Poll:</span>
                <p className="font-medium text-gray-600">
                  {pollingStatus.nextPoll 
                    ? new Date(pollingStatus.nextPoll).toLocaleString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className={`font-medium ${pollingStatus.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {pollingStatus.isHealthy ? 'Healthy' : 'Error'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
