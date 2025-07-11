import { NextRequest, NextResponse } from 'next/server'
import { repositoryService } from '@/services/repository'
import { githubService } from '@/services/github'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoName, email, notifyIssues, notifyStars, notifyPRs, notifyReleases } = body

    // Validate required fields
    if (!repoName || !email) {
      return NextResponse.json(
        { error: 'Repository name and email are required' },
        { status: 400 }
      )
    }

    // Validate repository format (owner/repo)
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    if (!repoPattern.test(repoName)) {
      return NextResponse.json(
        { error: 'Repository name must be in format "owner/repo"' },
        { status: 400 }
      )
    }

    // Get or create user
    const user = await repositoryService.getOrCreateUser(email)

    // Check if repository is already being tracked by this user
    const existingRepo = await repositoryService.findTrackedRepo(user.id, repoName)
    if (existingRepo) {
      return NextResponse.json(
        { error: 'Repository is already being tracked' },
        { status: 409 }
      )
    }

    // Verify repository exists on GitHub
    const [owner, repo] = repoName.split('/')
    try {
      await githubService.getRepository(owner, repo)
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found on GitHub' },
          { status: 404 }
        )
      }
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        console.warn('GitHub API credentials not configured properly, skipping repository validation')
        // Continue without GitHub validation for testing
      } else {
        throw error
      }
    }

    // Add repository to tracking
    const trackedRepo = await repositoryService.addTrackedRepo({
      repoName,
      userId: user.id,
      notifyIssues,
      notifyStars,
      notifyPRs,
      notifyReleases
    })

    return NextResponse.json(trackedRepo, { status: 201 })
  } catch (error) {
    console.error('Error adding tracked repository:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const user = await repositoryService.findUserByEmail(email)
    if (!user) {
      return NextResponse.json([], { status: 200 })
    }

    const trackedRepos = await repositoryService.getTrackedRepos(user.id)
    return NextResponse.json(trackedRepos, { status: 200 })
  } catch (error) {
    console.error('Error fetching tracked repositories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
