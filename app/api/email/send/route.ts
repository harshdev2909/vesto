import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    if (!to || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, type' },
        { status: 400 }
      )
    }

    let emailTemplate
    let emailData

    switch (type) {
      case 'deposit':
        emailTemplate = emailTemplates.deposit(
          data.amount,
          data.protocol,
          data.transactionHash
        )
        break
      
      case 'withdraw':
        emailTemplate = emailTemplates.withdraw(
          data.amount,
          data.protocol,
          data.transactionHash
        )
        break
      
      case 'rebalance':
        emailTemplate = emailTemplates.rebalance(
          data.oldProtocol,
          data.newProtocol,
          data.oldAPY,
          data.newAPY,
          data.transactionHash
        )
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }

    emailData = {
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    }

    const result = await sendEmail(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in email API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
