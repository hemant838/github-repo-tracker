export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  open_issues_count: number
  forks_count: number
  created_at: string
  updated_at: string
  html_url: string
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  created_at: string
  updated_at: string
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  created_at: string
  published_at: string | null
  html_url: string
  author: {
    login: string
    avatar_url: string
  }
}

export interface RepoActivity {
  repo: GitHubRepo
  newIssues: GitHubIssue[]
  newPRs: GitHubPullRequest[]
  newReleases: GitHubRelease[]
  starCountChange: number
}

export interface GitHubApiError {
  message: string
  status: number
}
