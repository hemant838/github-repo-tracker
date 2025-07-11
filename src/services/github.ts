import axios, { AxiosInstance } from 'axios'
import { 
  GitHubRepo, 
  GitHubIssue, 
  GitHubPullRequest, 
  GitHubRelease, 
  RepoActivity,
  GitHubApiError 
} from '@/types/github'

class GitHubService {
  private api: AxiosInstance

  constructor() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Repo-Tracker'
    }

    // Only add authorization if token is available and not a placeholder
    if (process.env.GITHUB_TOKEN &&
        process.env.GITHUB_TOKEN !== 'your_github_personal_access_token_here' &&
        process.env.GITHUB_TOKEN.startsWith('ghp_')) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }

    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers
    })
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}`)
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getIssues(owner: string, repo: string, since?: string): Promise<GitHubIssue[]> {
    try {
      const params: Record<string, string | number> = {
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: 100
      }
      
      if (since) {
        params.since = since
      }

      const response = await this.api.get(`/repos/${owner}/${repo}/issues`, { params })
      // Filter out pull requests (GitHub API includes PRs in issues endpoint)
      return response.data.filter((issue: GitHubIssue & { pull_request?: unknown }) => !issue.pull_request)
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getPullRequests(owner: string, repo: string, since?: string): Promise<GitHubPullRequest[]> {
    try {
      const params: Record<string, string | number> = {
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: 100
      }

      const response = await this.api.get(`/repos/${owner}/${repo}/pulls`, { params })

      if (since) {
        const sinceDate = new Date(since)
        return response.data.filter((pr: GitHubPullRequest) => new Date(pr.created_at) > sinceDate)
      }

      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
    try {
      const response = await this.api.get(`/repos/${owner}/${repo}/releases`, {
        params: { per_page: 100 }
      })
      return response.data
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  async getRepoActivity(
    owner: string, 
    repo: string, 
    lastChecked?: Date
  ): Promise<RepoActivity> {
    try {
      const [repoData, issues, prs, releases] = await Promise.all([
        this.getRepository(owner, repo),
        this.getIssues(owner, repo, lastChecked?.toISOString()),
        this.getPullRequests(owner, repo, lastChecked?.toISOString()),
        this.getReleases(owner, repo)
      ])

      // Filter new releases if lastChecked is provided
      const newReleases = lastChecked 
        ? releases.filter(release => new Date(release.created_at) > lastChecked)
        : releases

      return {
        repo: repoData,
        newIssues: issues,
        newPRs: prs,
        newReleases,
        starCountChange: 0 // Will be calculated by comparing with stored data
      }
    } catch (error: unknown) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): GitHubApiError {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: { message?: string }, status: number } }
      return {
        message: axiosError.response.data.message || 'GitHub API Error',
        status: axiosError.response.status
      }
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: (error as { message: string }).message,
        status: 500
      }
    }
    return {
      message: 'Unknown error',
      status: 500
    }
  }
}

export const githubService = new GitHubService()
