import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const testCollection = await getCollection('test')
    
    // Try to insert a test document
    const testDoc = {
      message: 'Database connection test',
      timestamp: new Date(),
      test: true
    }
    
    const result = await testCollection.insertOne(testDoc)
    
    // Clean up the test document
    await testCollection.deleteOne({ _id: result.insertedId })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testId: result.insertedId
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}