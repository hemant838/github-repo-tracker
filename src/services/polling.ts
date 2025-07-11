import { repositoryService } from './repository'
import { githubService } from './github'
import { notificationService } from './notification'
import { parseRepoName } from '@/lib/utils'
import { TrackedRepo, User } from '@prisma/client'


class PollingService {
  async checkAllRepositories(): Promise<void> {
    console.log('Starting repository polling...')
    
    try {
      // Get all tracked repositories with user information
      const trackedRepos = await repositoryService.getAllTrackedRepos()
      
      console.log(`Found ${trackedRepos.length} repositories to check`)

      // Process repositories in batches to avoid rate limiting
      const batchSize = 5
      for (let i = 0; i < trackedRepos.length; i += batchSize) {
        const batch = trackedRepos.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(trackedRepo => this.checkRepository(trackedRepo))
        )
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < trackedRepos.length) {
          await this.delay(2000) // 2 second delay between batches
        }
      }
      
      console.log('Repository polling completed')
    } catch (error) {
      console.error('Error during repository polling:', error)
    }
  }

  private async checkRepository(trackedRepo: TrackedRepo & { user: User }): Promise<void> {
    try {
      const repoInfo = parseRepoName(trackedRepo.repoName)
      if (!repoInfo) {
        console.error(`Invalid repository name: ${trackedRepo.repoName}`)
        return
      }

      const { owner, repo } = repoInfo
      
      console.log(`Checking repository: ${trackedRepo.repoName}`)

      // Get current activity from GitHub
      const activity = await githubService.getRepoActivity(
        owner,
        repo,
        trackedRepo.lastCheckedAt || undefined
      )

      // Calculate changes
      const starCountChange = activity.repo.stargazers_count - trackedRepo.lastStarCount
      activity.starCountChange = Math.max(0, starCountChange) // Only positive changes

      // Check if there are any new activities to notify about
      const hasNewActivity = (
        (trackedRepo.notifyIssues && activity.newIssues.length > 0) ||
        (trackedRepo.notifyPRs && activity.newPRs.length > 0) ||
        (trackedRepo.notifyReleases && activity.newReleases.length > 0) ||
        (trackedRepo.notifyStars && activity.starCountChange > 0)
      )

      // Update repository stats
      await repositoryService.updateRepoStats(trackedRepo.id, {
        lastIssueCount: activity.repo.open_issues_count,
        lastStarCount: activity.repo.stargazers_count,
        lastPRCount: activity.newPRs.length, // This is approximate
        lastReleaseCount: activity.newReleases.length
      })

      // Send notifications if there's new activity
      if (hasNewActivity) {
        console.log(`New activity found for ${trackedRepo.repoName}, sending notifications`)
        
        const notificationData = {
          user: trackedRepo.user,
          trackedRepo,
          activity
        }

        // Send email notification
        try {
          await notificationService.sendEmailNotification(notificationData)
        } catch (error) {
          console.error(`Failed to send email notification for ${trackedRepo.repoName}:`, error)
        }

        // Send Telegram notification (if configured)
        try {
          await notificationService.sendTelegramNotification(notificationData)
        } catch (error) {
          console.error(`Failed to send Telegram notification for ${trackedRepo.repoName}:`, error)
        }
      } else {
        console.log(`No new activity for ${trackedRepo.repoName}`)
      }

    } catch (error: unknown) {
      console.error(`Error checking repository ${trackedRepo.repoName}:`, error)

      // If it's a rate limit error, we should handle it gracefully
      if (error && typeof error === 'object' && 'status' in error && error.status === 403 && 'message' in error && typeof error.message === 'string' && error.message.includes('rate limit')) {
        console.log('GitHub API rate limit reached, pausing polling')
        await this.delay(60000) // Wait 1 minute
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getPollingStatus(): Promise<{
    totalRepos: number
    lastPolled: Date | null
    nextPoll: Date | null
  }> {
    const trackedRepos = await repositoryService.getAllTrackedRepos()
    
    // Find the most recently checked repository
    const lastChecked = trackedRepos.reduce((latest, repo) => {
      return !latest || repo.lastCheckedAt > latest 
        ? repo.lastCheckedAt 
        : latest
    }, null as Date | null)

    // Calculate next poll time (10 minutes from last check)
    const nextPoll = lastChecked 
      ? new Date(lastChecked.getTime() + 10 * 60 * 1000)
      : new Date()

    return {
      totalRepos: trackedRepos.length,
      lastPolled: lastChecked,
      nextPoll
    }
  }
}

export const pollingService = new PollingService()
