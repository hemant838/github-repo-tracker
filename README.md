# 🔔 GitHub Repository Tracker

A modern, full-stack web application that allows users to track public GitHub repositories and receive real-time notifications when there are new issues, pull requests, stars, or releases. Built with Next.js 15, TypeScript, and PostgreSQL.

![GitHub Repo Tracker](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎯 Core Features

- **📊 Repository Tracking**: Add any public GitHub repository to monitor
- **📧 Email Notifications**: Beautiful HTML email alerts via Resend
- **📱 Telegram Integration**: Optional Telegram bot notifications
- **⚙️ Customizable Alerts**: Choose what to track (issues, PRs, releases, stars)
- **📈 Real-time Dashboard**: View all tracked repositories and their statistics
- **🔄 Automated Polling**: Background service checks for updates every 10 minutes
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS

### 🛡️ Technical Features

- **Type Safety**: Full TypeScript implementation
- **Database ORM**: Prisma with PostgreSQL
- **API Rate Limiting**: Smart GitHub API usage with rate limit handling
- **Error Handling**: Comprehensive error handling and logging
- **Testing**: Jest test suite included
- **Production Ready**: Optimized for Vercel deployment

## 🛠️ Tech Stack

| Category          | Technology                                         |
| ----------------- | -------------------------------------------------- |
| **Frontend**      | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend**       | Next.js API Routes, Prisma ORM                     |
| **Database**      | PostgreSQL (Neon), SQLite (development)            |
| **Notifications** | Resend (email), Telegram Bot API                   |
| **Deployment**    | Vercel with CRON jobs                              |
| **Testing**       | Jest, TypeScript                                   |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### Required API Keys

- **GitHub Personal Access Token** (for API access)
- **Resend API Key** (for email notifications)
- **Telegram Bot Token** (optional, for Telegram notifications)

## � Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/github-repo-tracker.git
cd github-repo-tracker
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/github_tracker"
# For development with SQLite: DATABASE_URL="file:./dev.db"

# GitHub API
GITHUB_TOKEN="ghp_your_github_personal_access_token_here"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"
FROM_EMAIL="GitHub Repo Tracker <noreply@yourdomain.com>"

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
TELEGRAM_CHAT_ID="your_telegram_chat_id_here"

# Security
CRON_SECRET="your_secure_random_string_here"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and apply database migration
npx prisma migrate dev --name init

# Optional: View your database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test Email Functionality

```bash
# Test email notifications
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## 🔑 Getting API Keys

### GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "GitHub Repo Tracker"
4. Select scopes: `public_repo` (for public repositories)
5. Click "Generate token" and copy the token
6. Add to your `.env.local` file as `GITHUB_TOKEN`

### Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to your dashboard and click "API Keys"
3. Create a new API key
4. Copy the key and add to your `.env.local` file as `RESEND_API_KEY`
5. (Optional) Add and verify your domain for custom sender emails

### Telegram Bot (Optional)

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token and add to your `.env.local` file as `TELEGRAM_BOT_TOKEN`
4. Get your chat ID by messaging [@userinfobot](https://t.me/userinfobot)
5. Add the chat ID to your `.env.local` file as `TELEGRAM_CHAT_ID`

## 📖 API Documentation

### Endpoints

| Method   | Endpoint                        | Description                               |
| -------- | ------------------------------- | ----------------------------------------- |
| `GET`    | `/api/status`                   | Get system status and polling information |
| `GET`    | `/api/repos?email={email}`      | Get tracked repositories for a user       |
| `POST`   | `/api/repos`                    | Add a new repository to track             |
| `PUT`    | `/api/repos/[id]`               | Update repository notification settings   |
| `DELETE` | `/api/repos/[id]?email={email}` | Remove repository from tracking           |
| `GET`    | `/api/cron`                     | Trigger background polling (CRON job)     |
| `POST`   | `/api/test-email`               | Send test email notification              |

### Example API Usage

```bash
# Add a repository to track
curl -X POST http://localhost:3000/api/repos \
  -H "Content-Type: application/json" \
  -d '{
    "repoName": "facebook/react",
    "email": "user@example.com",
    "notifyIssues": true,
    "notifyStars": true,
    "notifyPRs": true,
    "notifyReleases": true
  }'

# Get tracked repositories
curl "http://localhost:3000/api/repos?email=user@example.com"

# Check system status
curl http://localhost:3000/api/status
```

## 🏗️ Project Structure

```
github-repo-tracker/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API routes
│   │   │   ├── cron/          # Background job endpoint
│   │   │   ├── repos/         # Repository management
│   │   │   ├── status/        # System status
│   │   │   └── test-email/    # Email testing
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── AddRepoForm.tsx    # Add repository form
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── RepoCard.tsx       # Repository card
│   │   └── StatusCard.tsx     # Status display card
│   ├── lib/                   # Utility functions
│   │   ├── prisma.ts          # Database client
│   │   └── utils.ts           # Helper functions
│   ├── services/              # Business logic
│   │   ├── github.ts          # GitHub API service
│   │   ├── notification.ts    # Email/Telegram service
│   │   ├── polling.ts         # Background polling
│   │   └── repository.ts      # Database operations
│   ├── types/                 # TypeScript definitions
│   │   └── github.ts          # GitHub API types
│   └── __tests__/             # Test files
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
└── vercel.json                # Deployment config
```

## 🔄 How It Works

### 1. User Flow

1. **Registration**: Users enter their email to start tracking repositories
2. **Add Repositories**: Users add GitHub repositories in `owner/repo` format
3. **Customize Notifications**: Choose what to track (issues, PRs, releases, stars)
4. **Monitor Dashboard**: View all tracked repositories and their statistics

### 2. Background Processing

1. **CRON Job**: Runs every 10 minutes via Vercel CRON
2. **GitHub API Polling**: Fetches latest data for all tracked repositories
3. **Change Detection**: Compares current data with stored data
4. **Notification Dispatch**: Sends emails/Telegram messages for new activity

### 3. Notification System

- **Email**: Beautiful HTML emails via Resend with activity summaries
- **Telegram**: Optional bot notifications with markdown formatting
- **Customizable**: Users can enable/disable specific notification types

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**: Ensure your code is in a GitHub repository

2. **Connect to Vercel**:

   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `GITHUB_TOKEN`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `CRON_SECRET`
   - `NEXTAUTH_SECRET`

4. **Database Migration**:
   ```bash
   # Run this after deployment
   npx prisma migrate deploy
   ```

### CRON Job Configuration

The `vercel.json` file configures automatic polling:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

This runs the polling service every 10 minutes automatically.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage

# Test specific file
npm test -- AddRepoForm.test.tsx
```

### Test Email Functionality

```bash
# Test email notifications
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## 💡 Usage Examples

### Adding a Repository

1. Enter your email address on the homepage
2. Click "Add Repository"
3. Enter repository name (e.g., `facebook/react`)
4. Choose notification preferences:
   - ✅ Issues: Get notified of new issues
   - ✅ Pull Requests: Get notified of new PRs
   - ✅ Releases: Get notified of new releases
   - ✅ Stars: Get notified of star count increases
5. Click "Add Repository"

### Managing Notifications

- **View Dashboard**: See all tracked repositories and their stats
- **Update Settings**: Click the settings icon on any repository card
- **Remove Repository**: Click the trash icon to stop tracking

### Email Notifications

You'll receive beautiful HTML emails containing:

- Repository information and description
- Summary of new activity (issues, PRs, releases, stars)
- Direct links to new issues and pull requests
- Release notes for new releases

## 🔧 Configuration

### Environment Variables

| Variable             | Required | Description                   |
| -------------------- | -------- | ----------------------------- |
| `DATABASE_URL`       | ✅       | PostgreSQL connection string  |
| `GITHUB_TOKEN`       | ✅       | GitHub Personal Access Token  |
| `RESEND_API_KEY`     | ✅       | Resend API key for emails     |
| `FROM_EMAIL`         | ✅       | Sender email address          |
| `TELEGRAM_BOT_TOKEN` | ❌       | Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID`   | ❌       | Telegram chat ID (optional)   |
| `CRON_SECRET`        | ✅       | Secret for CRON job security  |
| `NEXTAUTH_SECRET`    | ✅       | NextAuth secret key           |

### Database Schema

The application uses two main models:

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  trackedRepos TrackedRepo[]
}

model TrackedRepo {
  id               String   @id @default(cuid())
  repoName         String   // Format: "owner/repo"
  notifyIssues     Boolean  @default(true)
  notifyStars      Boolean  @default(true)
  notifyPRs        Boolean  @default(true)
  notifyReleases   Boolean  @default(true)
  lastCheckedAt    DateTime @default(now())
  lastIssueCount   Int      @default(0)
  lastStarCount    Int      @default(0)
  lastPRCount      Int      @default(0)
  lastReleaseCount Int      @default(0)
  userId           String
  user             User     @relation(fields: [userId], references: [id])
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure they follow the coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Submit a pull request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset

# Check database connection
npx prisma db pull
```

#### GitHub API Rate Limits

- **Issue**: API calls failing with 403 errors
- **Solution**: Ensure you have a valid GitHub Personal Access Token
- **Rate Limits**:
  - Unauthenticated: 60 requests/hour
  - Authenticated: 5,000 requests/hour

#### Email Delivery Issues

```bash
# Test email configuration
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

- Verify Resend API key is valid
- Check sender domain is verified in Resend
- Ensure `FROM_EMAIL` format is correct

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Performance Optimization

- **Database**: Use connection pooling for production
- **API**: Implement caching for GitHub API responses
- **Monitoring**: Set up error tracking (Sentry, LogRocket)

## 📊 Monitoring & Analytics

### System Health Checks

- **Status Endpoint**: `GET /api/status`
- **Database Health**: Monitor connection pool
- **GitHub API**: Track rate limit usage
- **Email Delivery**: Monitor Resend webhook events

### Metrics to Track

- Number of tracked repositories
- Email delivery success rate
- GitHub API response times
- User engagement metrics

## 🔒 Security

### Best Practices Implemented

- **Environment Variables**: Sensitive data stored securely
- **API Rate Limiting**: Prevents abuse
- **Input Validation**: All user inputs validated
- **CRON Security**: Protected with secret token
- **Database**: Parameterized queries prevent SQL injection

### Security Checklist

- [ ] Rotate API keys regularly
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use HTTPS in production
- [ ] Implement proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [Resend](https://resend.com/) - Email delivery service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/github-repo-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/github-repo-tracker/discussions)
- **Email**: support@yourdomain.com

---

<div align="center">
  <p>Made with ❤️ by [Your Name]</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
