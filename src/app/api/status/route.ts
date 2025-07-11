import { NextResponse } from 'next/server'
import { pollingService } from '@/services/polling'

export async function GET() {
  try {
    const status = await pollingService.getPollingStatus()
    
    return NextResponse.json({
      ...status,
      isHealthy: true,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error getting polling status:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get status',
        isHealthy: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
