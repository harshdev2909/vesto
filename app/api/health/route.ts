import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const testCollection = await getCollection('health_check')
    
    // Test basic operations
    const testDoc = {
      message: 'Health check',
      timestamp: new Date(),
      test: true
    }
    
    const result = await testCollection.insertOne(testDoc)
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId })
    
    return NextResponse.json({
      success: true,
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      testId: result.insertedId
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
