# Email Configuration Setup

This guide explains how to configure email notifications for the Vesto Yield Aggregator.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM="Vesto Yield Aggregator" <your_email@gmail.com>
```

## Gmail Setup

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- In your Google Account settings, go to Security
- Under "2-Step Verification", click on "App passwords"
- Select "Mail" as the app
- Generate a new app password
- Use this password (not your regular Gmail password) as `EMAIL_PASS`

### 3. Configure Environment Variables
```bash
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM="Vesto Yield Aggregator" <your_actual_email@gmail.com>
```

## Testing Email Configuration

1. Start the development server: `npm run dev`
2. Navigate to the profile page
3. Enter your email address in the email settings
4. Click "Send Test Email" to verify the configuration

## Email Types

The system sends emails for:
- **Deposit**: When users deposit assets
- **Withdraw**: When users withdraw assets  
- **Rebalance**: When the system rebalances assets

## Troubleshooting

### Common Issues

1. **"Email credentials not configured"**
   - Ensure all three email environment variables are set
   - Check that the values don't have extra spaces or quotes

2. **"Invalid login" or "Authentication failed"**
   - Verify you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled on your Google account

3. **"Email sent successfully" but no email received**
   - Check your spam/junk folder
   - Verify the email address is correct
   - Check Gmail's "Less secure app access" settings

### Debug Mode

To see detailed email logs, check the console output when running the development server. Successful emails will show:
```
Email sent successfully: <message-id>
```

Failed emails will show:
```
Error sending email: <error-message>
```

## Security Notes

- Never commit `.env.local` to version control
- Use App Passwords instead of your main Gmail password
- Consider using a dedicated email account for production
- Rotate App Passwords regularly for security
