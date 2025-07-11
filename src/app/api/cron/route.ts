import { NextRequest, NextResponse } from 'next/server'
import { pollingService } from '@/services/polling'

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has the correct authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('CRON job triggered - starting repository polling')
    
    const startTime = Date.now()
    
    // Run the polling service
    await pollingService.checkAllRepositories()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`CRON job completed in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Repository polling completed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('CRON job failed:', error)
    
    return NextResponse.json(
      { 
        error: 'CRON job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
