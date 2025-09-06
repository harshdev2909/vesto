import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "harshsharmaa990@gmail.com",
    pass: "gncqwoyeibggmjxz",
  },
})

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    const mailOptions = {
      from: '"Vesto Yield Aggregator" <harshsharmaa990@gmail.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email templates
export const emailTemplates = {
  deposit: (amount: string, protocol: string, transactionHash: string) => ({
    subject: `💰 Deposit Confirmed - ${amount} USDC`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💰 Deposit Confirmed</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your funds have been successfully deposited</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Transaction Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #64748b;">Amount:</strong>
              <span style="color: #059669; font-weight: bold; font-size: 18px; margin-left: 10px;">${amount} USDC</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #64748b;">Protocol:</strong>
              <span style="color: #1e293b; margin-left: 10px;">${protocol}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #64748b;">Transaction Hash:</strong>
              <br>
              <a href="https://sepolia.arbiscan.io/tx/${transactionHash}" 
                 style="color: #3b82f6; text-decoration: none; word-break: break-all; font-family: monospace;">
                ${transactionHash}
              </a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>💡 Tip:</strong> Your funds are now earning yield automatically. Check your dashboard to monitor performance.
              </p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>This is an automated message from Vesto Yield Aggregator</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">Powered by</p>
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pPE3yFlVET1TfkAFNrSaoLcd2gV5VT.png" 
                 alt="Arbitrum logo" 
                 style="height: 20px; width: auto;" />
          </div>
        </div>
      </div>
    `
  }),

  withdraw: (amount: string, protocol: string, transactionHash: string) => ({
    subject: `💸 Withdrawal Confirmed - ${amount} USDC`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💸 Withdrawal Confirmed</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Your funds have been successfully withdrawn</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Transaction Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #64748b;">Amount:</strong>
              <span style="color: #dc2626; font-weight: bold; font-size: 18px; margin-left: 10px;">${amount} USDC</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #64748b;">Protocol:</strong>
              <span style="color: #1e293b; margin-left: 10px;">${protocol}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #64748b;">Transaction Hash:</strong>
              <br>
              <a href="https://sepolia.arbiscan.io/tx/${transactionHash}" 
                 style="color: #3b82f6; text-decoration: none; word-break: break-all; font-family: monospace;">
                ${transactionHash}
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💡 Note:</strong> Your withdrawal has been processed. The funds should appear in your wallet shortly.
              </p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>This is an automated message from Vesto Yield Aggregator</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">Powered by</p>
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pPE3yFlVET1TfkAFNrSaoLcd2gV5VT.png" 
                 alt="Arbitrum logo" 
                 style="height: 20px; width: auto;" />
          </div>
        </div>
      </div>
    `
  }),

  rebalance: (oldProtocol: string, newProtocol: string, oldAPY: string, newAPY: string, transactionHash: string) => ({
    subject: `🔄 Rebalance Executed - ${oldProtocol} → ${newProtocol}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Rebalance Executed</h1>
          <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Your funds have been moved to a better yield opportunity</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Rebalance Details</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #f1f5f9; padding: 15px; border-radius: 6px;">
              <div style="text-align: center; flex: 1;">
                <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">FROM</div>
                <div style="color: #dc2626; font-weight: bold; font-size: 16px;">${oldProtocol}</div>
                <div style="color: #64748b; font-size: 14px;">${oldAPY}% APY</div>
              </div>
              <div style="display: flex; align-items: center; margin: 0 10px;">
                <div style="font-size: 24px; color: #8b5cf6;">→</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">TO</div>
                <div style="color: #059669; font-weight: bold; font-size: 16px;">${newProtocol}</div>
                <div style="color: #64748b; font-size: 14px;">${newAPY}% APY</div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #64748b;">Transaction Hash:</strong>
              <br>
              <a href="https://sepolia.arbiscan.io/tx/${transactionHash}" 
                 style="color: #3b82f6; text-decoration: none; word-break: break-all; font-family: monospace;">
                ${transactionHash}
              </a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>🎯 Optimization:</strong> Your funds have been automatically moved to capture higher yield. This rebalancing helps maximize your returns.
              </p>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>This is an automated message from Vesto Yield Aggregator</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">Powered by</p>
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pPE3yFlVET1TfkAFNrSaoLcd2gV5VT.png" 
                 alt="Arbitrum logo" 
                 style="height: 20px; width: auto;" />
          </div>
        </div>
      </div>
    `
  })
}
