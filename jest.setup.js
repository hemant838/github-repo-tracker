// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock environment variables for testing
process.env.GITHUB_TOKEN = 'test_token'
process.env.RESEND_API_KEY = 'test_resend_key'
