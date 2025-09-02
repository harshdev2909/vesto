import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol1Name, protocol2Name } = body
    
    if (!protocol1Name || !protocol2Name) {
      return NextResponse.json(
        { error: 'Missing required parameters: protocol1Name, protocol2Name' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('vesto_yield_aggregator')
    
    // Update protocol names
    const result1 = await db.collection('protocols').updateOne(
      { address: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e' }, // First protocol
      { 
        $set: { 
          name: protocol1Name,
          updatedAt: new Date()
        }
      }
    )
    
    const result2 = await db.collection('protocols').updateOne(
      { address: '0x54fa761eb183fed9809cf06a97cd273b39ace25c' }, // Second protocol
      { 
        $set: { 
          name: protocol2Name,
          updatedAt: new Date()
        }
      }
    )
    
    if (result1.matchedCount === 0 || result2.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Protocol records not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Protocol names updated successfully',
      data: {
        protocol1: {
          address: '0xbaf7dd10b229615246a37cbd595fc2fdd2cd8a8e',
          oldName: 'Mock Aave',
          newName: protocol1Name
        },
        protocol2: {
          address: '0x54fa761eb183fed9809cf06a97cd273b39ace25c',
          oldName: 'Mock Compound',
          newName: protocol2Name
        }
      }
    })
    
  } catch (error) {
    console.error('Error updating protocol names:', error)
    return NextResponse.json(
      { error: 'Failed to update protocol names' },
      { status: 500 }
    )
  }
}
