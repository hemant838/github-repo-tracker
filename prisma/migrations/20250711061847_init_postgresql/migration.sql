-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracked_repos" (
    "id" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "notifyIssues" BOOLEAN NOT NULL DEFAULT true,
    "notifyStars" BOOLEAN NOT NULL DEFAULT true,
    "notifyPRs" BOOLEAN NOT NULL DEFAULT true,
    "notifyReleases" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastIssueCount" INTEGER NOT NULL DEFAULT 0,
    "lastStarCount" INTEGER NOT NULL DEFAULT 0,
    "lastPRCount" INTEGER NOT NULL DEFAULT 0,
    "lastReleaseCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tracked_repos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tracked_repos_userId_repoName_key" ON "tracked_repos"("userId", "repoName");

-- AddForeignKey
ALTER TABLE "tracked_repos" ADD CONSTRAINT "tracked_repos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
