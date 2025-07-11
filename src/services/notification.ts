import { Resend } from 'resend'
import { RepoActivity } from '@/types/github'
import { TrackedRepo, User } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface NotificationData {
  user: User
  trackedRepo: TrackedRepo
  activity: RepoActivity
}

class NotificationService {
  async sendEmailNotification(data: NotificationData): Promise<void> {
    const { user, trackedRepo, activity } = data
    const { repo, newIssues, newPRs, newReleases, starCountChange } = activity

    // Build notification content
    const notifications: string[] = []

    if (trackedRepo.notifyIssues && newIssues.length > 0) {
      notifications.push(`📝 ${newIssues.length} new issue(s)`)
    }

    if (trackedRepo.notifyPRs && newPRs.length > 0) {
      notifications.push(`🔄 ${newPRs.length} new pull request(s)`)
    }

    if (trackedRepo.notifyReleases && newReleases.length > 0) {
      notifications.push(`🚀 ${newReleases.length} new release(s)`)
    }

    if (trackedRepo.notifyStars && starCountChange > 0) {
      notifications.push(`⭐ ${starCountChange} new star(s)`)
    }

    if (notifications.length === 0) {
      return // No notifications to send
    }

    const subject = `GitHub Activity: ${repo.full_name}`
    const htmlContent = this.generateEmailHTML(data, notifications)

    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'GitHub Repo Tracker <onboarding@resend.dev>',
        to: [user.email],
        subject,
        html: htmlContent
      })

      console.log(`Email notification sent to ${user.email} for ${repo.full_name}`)
    } catch (error) {
      console.error('Failed to send email notification:', error)
      throw error
    }
  }

  async sendTelegramNotification(data: NotificationData): Promise<void> {
    const { trackedRepo, activity } = data
    const { repo, newIssues, newPRs, newReleases, starCountChange } = activity

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.log('Telegram bot credentials not configured')
      return
    }

    // Build notification message
    const notifications: string[] = []

    if (trackedRepo.notifyIssues && newIssues.length > 0) {
      notifications.push(`📝 ${newIssues.length} new issue(s)`)
    }

    if (trackedRepo.notifyPRs && newPRs.length > 0) {
      notifications.push(`🔄 ${newPRs.length} new pull request(s)`)
    }

    if (trackedRepo.notifyReleases && newReleases.length > 0) {
      notifications.push(`🚀 ${newReleases.length} new release(s)`)
    }

    if (trackedRepo.notifyStars && starCountChange > 0) {
      notifications.push(`⭐ ${starCountChange} new star(s)`)
    }

    if (notifications.length === 0) {
      return // No notifications to send
    }

    const message = `🔔 *GitHub Activity Alert*\n\n` +
      `Repository: [${repo.full_name}](${repo.html_url})\n\n` +
      notifications.join('\n') + '\n\n' +
      `Check it out: ${repo.html_url}`

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      })

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`)
      }

      console.log(`Telegram notification sent for ${repo.full_name}`)
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      throw error
    }
  }

  private generateEmailHTML(data: NotificationData, notifications: string[]): string {
    const { activity } = data
    const { repo, newIssues, newPRs, newReleases } = activity

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>GitHub Activity Alert</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #24292e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f6f8fa; }
            .notification { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #0366d6; }
            .footer { text-align: center; padding: 20px; color: #666; }
            a { color: #0366d6; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 GitHub Activity Alert</h1>
            </div>
            <div class="content">
              <h2><a href="${repo.html_url}">${repo.full_name}</a></h2>
              <p>${repo.description || 'No description available'}</p>
              
              <h3>Recent Activity:</h3>
              ${notifications.map(notification => `<div class="notification">${notification}</div>`).join('')}
              
              ${newIssues.length > 0 ? `
                <h3>New Issues:</h3>
                ${newIssues.slice(0, 5).map(issue => `
                  <div class="notification">
                    <strong><a href="${issue.html_url}">#${issue.number}: ${issue.title}</a></strong>
                    <br>by ${issue.user.login}
                  </div>
                `).join('')}
              ` : ''}
              
              ${newPRs.length > 0 ? `
                <h3>New Pull Requests:</h3>
                ${newPRs.slice(0, 5).map(pr => `
                  <div class="notification">
                    <strong><a href="${pr.html_url}">#${pr.number}: ${pr.title}</a></strong>
                    <br>by ${pr.user.login}
                  </div>
                `).join('')}
              ` : ''}
              
              ${newReleases.length > 0 ? `
                <h3>New Releases:</h3>
                ${newReleases.slice(0, 3).map(release => `
                  <div class="notification">
                    <strong><a href="${release.html_url}">${release.tag_name}: ${release.name || 'Unnamed Release'}</a></strong>
                    <br>by ${release.author.login}
                  </div>
                `).join('')}
              ` : ''}
            </div>
            <div class="footer">
              <p>You're receiving this because you're tracking <a href="${repo.html_url}">${repo.full_name}</a></p>
              <p>GitHub Repo Tracker</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export const notificationService = new NotificationService()
