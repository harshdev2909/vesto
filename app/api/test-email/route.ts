import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = 'deposit' } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address required' },
        { status: 400 }
      )
    }

    let emailTemplate
    let testData

    switch (type) {
      case 'deposit':
        testData = {
          amount: '1.00',
          protocol: 'Mock Aave',
          transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
        }
        emailTemplate = emailTemplates.deposit(testData.amount, testData.protocol, testData.transactionHash)
        break
      
      case 'withdraw':
        testData = {
          amount: '0.50',
          protocol: 'Mock Compound',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12'
        }
        emailTemplate = emailTemplates.withdraw(testData.amount, testData.protocol, testData.transactionHash)
        break
      
      case 'rebalance':
        testData = {
          oldProtocol: 'Mock Aave',
          newProtocol: 'Mock Compound',
          oldAPY: '3.00',
          newAPY: '3.50',
          transactionHash: '0x9876543210fedcba9876543210fedcba98765432'
        }
        emailTemplate = emailTemplates.rebalance(
          testData.oldProtocol,
          testData.newProtocol,
          testData.oldAPY,
          testData.newAPY,
          testData.transactionHash
        )
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }

    const emailData = {
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    }

    console.log('🧪 Sending test email:', { type, email, testData })

    const result = await sendEmail(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        type,
        testData
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in test email API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
