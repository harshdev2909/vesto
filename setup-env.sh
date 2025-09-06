#!/bin/bash

echo "🚀 Setting up Vesto Frontend Environment..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy from template
cp env.example .env.local

echo "✅ Environment file created: .env.local"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your MongoDB connection string"
echo "2. Add your WalletConnect Project ID (optional)"
echo "3. Add your email credentials for notifications (optional)"
echo "4. Start the development server: npm run dev"
echo ""
echo "🔗 MongoDB options:"
echo "   Local: MONGODB_URI=mongodb://localhost:27017/vesto_yield_aggregator"
echo "   Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vesto_yield_aggregator"
echo ""
echo "🌐 Get WalletConnect Project ID at: https://cloud.walletconnect.com"
echo ""
echo "📧 Email Configuration:"
echo "   EMAIL_USER=your_email@gmail.com"
echo "   EMAIL_PASS=your_app_password_here"
echo "   EMAIL_FROM=\"Vesto Yield Aggregator\" <your_email@gmail.com>"
echo "   Note: Use Gmail App Password, not your regular password"
echo ""
echo "🎯 To seed the database, visit: http://localhost:3000/admin"
