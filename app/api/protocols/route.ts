import { NextRequest, NextResponse } from 'next/server'
import { getProtocols, createProtocol } from '@/lib/db'
import { Protocol, APIResponse } from '@/lib/types'

export async function GET() {
  try {
    const protocols = await getProtocols()
    
    const response: APIResponse<Protocol[]> = {
      success: true,
      data: protocols
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching protocols:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to fetch protocols'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, vaultAddress, description, website, logo } = body
    
    // Validation
    if (!name || !address || !vaultAddress) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Missing required fields: name, address, vaultAddress'
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    // Check if protocol already exists
    const existingProtocols = await getProtocols()
    const protocolExists = existingProtocols.some(protocol => 
      protocol.address.toLowerCase() === address.toLowerCase() || 
      protocol.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()
    )
    
    if (protocolExists) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Protocol already exists with this address or vault address'
      }
      return NextResponse.json(response, { status: 409 })
    }
    
    const newProtocol = await createProtocol({
      name,
      address,
      vaultAddress,
      description,
      website,
      logo,
      isActive: true
    })
    
    const response: APIResponse<Protocol> = {
      success: true,
      data: newProtocol,
      message: 'Protocol created successfully'
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating protocol:', error)
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to create protocol'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
