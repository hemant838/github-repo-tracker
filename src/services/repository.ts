import { prisma } from '@/lib/prisma'
import { TrackedRepo, User } from '@prisma/client'

export interface CreateTrackedRepoData {
  repoName: string
  userId: string
  notifyIssues?: boolean
  notifyStars?: boolean
  notifyPRs?: boolean
  notifyReleases?: boolean
}

export interface UpdateTrackedRepoData {
  notifyIssues?: boolean
  notifyStars?: boolean
  notifyPRs?: boolean
  notifyReleases?: boolean
  lastIssueCount?: number
  lastStarCount?: number
  lastPRCount?: number
  lastReleaseCount?: number
  lastCheckedAt?: Date
}

class RepositoryService {
  async createUser(email: string): Promise<User> {
    return await prisma.user.create({
      data: { email }
    })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async getOrCreateUser(email: string): Promise<User> {
    let user = await this.findUserByEmail(email)
    if (!user) {
      user = await this.createUser(email)
    }
    return user
  }

  async addTrackedRepo(data: CreateTrackedRepoData): Promise<TrackedRepo> {
    return await prisma.trackedRepo.create({
      data: {
        repoName: data.repoName,
        userId: data.userId,
        notifyIssues: data.notifyIssues ?? true,
        notifyStars: data.notifyStars ?? true,
        notifyPRs: data.notifyPRs ?? true,
        notifyReleases: data.notifyReleases ?? true
      }
    })
  }

  async getTrackedRepos(userId: string): Promise<TrackedRepo[]> {
    return await prisma.trackedRepo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getAllTrackedRepos(): Promise<(TrackedRepo & { user: User })[]> {
    return await prisma.trackedRepo.findMany({
      include: { user: true },
      orderBy: { lastCheckedAt: 'asc' }
    })
  }

  async updateTrackedRepo(id: string, data: UpdateTrackedRepoData): Promise<TrackedRepo> {
    return await prisma.trackedRepo.update({
      where: { id },
      data
    })
  }

  async removeTrackedRepo(id: string, userId: string): Promise<TrackedRepo> {
    return await prisma.trackedRepo.delete({
      where: { 
        id,
        userId // Ensure user can only delete their own repos
      }
    })
  }

  async findTrackedRepo(userId: string, repoName: string): Promise<TrackedRepo | null> {
    return await prisma.trackedRepo.findUnique({
      where: {
        userId_repoName: {
          userId,
          repoName
        }
      }
    })
  }

  async updateRepoStats(
    id: string, 
    stats: {
      lastIssueCount: number
      lastStarCount: number
      lastPRCount: number
      lastReleaseCount: number
    }
  ): Promise<TrackedRepo> {
    return await prisma.trackedRepo.update({
      where: { id },
      data: {
        ...stats,
        lastCheckedAt: new Date()
      }
    })
  }
}

export const repositoryService = new RepositoryService()
