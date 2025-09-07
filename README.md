# 🌐 Vesto - Yield Aggregator Frontend

A modern, responsive Next.js frontend for the Arbitrum Yield Aggregator platform. Built with React 19, TypeScript, and Tailwind CSS, providing an intuitive interface for yield farming and portfolio management.

## 🎯 Features

### **Core Functionality**
- **🔗 Wallet Connection**: RainbowKit + Wagmi integration with multiple wallet support
- **💰 Deposit System**: Two-step approval and deposit process with real-time validation
- **💸 Withdrawal System**: Secure withdrawal with preview and confirmation
- **🔄 Rebalancing**: Manual and automated portfolio rebalancing with history tracking
- **📊 Dashboard**: Comprehensive portfolio overview with real-time data
- **📈 Analytics**: APY comparison charts, TVL trends, and performance metrics

### **Advanced Features**
- **🌊 HyperZone**: Hyperliquid funding rate simulation with dynamic APY calculations
- **📧 Email Notifications**: Automated email alerts for deposits, withdrawals, and rebalances
- **🔔 Real-time Notifications**: In-app notification system with transaction tracking
- **📱 Responsive Design**: Mobile-first design with dark/light theme support
- **🎮 Simulation Mode**: Portfolio projection and "Explain Like I'm 5" mode
- **📋 Transaction History**: Complete transaction log with Arbiscan integration

### **Protocol Support**
- **Mock Aave**: Dynamic APY and TVL data
- **Mock Compound**: Real-time yield information
- **Hyperliquid**: Funding rate simulation (Coming Soon)
- **Uniswap**: Liquidity provision simulation (Coming Soon)

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 15**: React framework with App Router and Server Components
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety and development experience

### **Styling & UI**
- **Tailwind CSS 4**: Utility-first CSS framework with latest features
- **Shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Headless UI primitives for complex components
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, customizable icons

### **Web3 Integration**
- **Wagmi v2**: React hooks for Ethereum with latest features
- **RainbowKit**: Beautiful wallet connection UI
- **Viem**: Type-safe Ethereum library
- **Ethers.js**: Ethereum utilities and contract interaction

### **State Management & Data**
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management and caching
- **SWR**: Data fetching with revalidation
- **React Hook Form**: Performant forms with validation

### **Backend & Database**
- **MongoDB**: Document database for user data and transactions
- **Mongoose**: MongoDB object modeling
- **Nodemailer**: Email service integration
- **Next.js API Routes**: Full-stack API endpoints

### **Charts & Visualization**
- **Recharts**: Composable charting library
- **Custom Components**: APY comparison, TVL trends, portfolio analytics

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- MetaMask or other Web3 wallet
- Arbitrum Sepolia testnet ETH (get from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia))

### **1. Clone Repository**
```bash
git clone https://github.com/harshdev2909/vesto.git
cd vesto
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your configuration
```

### **4. Environment Configuration**
```bash
# Required: Contract addresses (from smart contracts deployment)
NEXT_PUBLIC_YIELD_AGGREGATOR_ADDRESS=0x4029d4e11e6C13e6Af93602475B505e32CA5B4E6
NEXT_PUBLIC_YIELD_ROUTER_ADDRESS=0xE7cbBF5098997e6eD3c62d39f975086fc064798b
NEXT_PUBLIC_RECEIPT_TOKEN_ADDRESS=0xAA465854a489e012096995332916CAe98E02ba0c

# Required: Network configuration
NEXT_PUBLIC_NETWORK_ID=421614
NEXT_PUBLIC_NETWORK_NAME="Arbitrum Sepolia"
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Optional: Email notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM="Vesto Yield Aggregator" <your_email@gmail.com>

# Optional: Database
MONGODB_URI=mongodb://localhost:27017/vesto_yield_aggregator

# Optional: WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### **5. Start Development Server**
```bash
npm run dev
```

**Frontend will be available at**: [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

### **🏠 Landing Page (`/`)**
- **Protocol Showcase**: Available protocols with APY, TVL, and risk metrics
- **Live Platform Stats**: Total deposited, active users, average APY
- **Activity Feed**: Real-time platform activity
- **Simulation Mode**: Portfolio projection and comparison tools
- **Connect Wallet**: Seamless wallet connection flow

### **📊 Dashboard (`/dashboard`)**
- **Portfolio Overview**: Current positions and performance
- **Asset Management**: Deposit, withdraw, and rebalance actions
- **APY Comparison**: Real-time yield comparisons across protocols
- **Transaction History**: Complete activity log with Arbiscan links
- **Email Settings**: Notification preferences and test emails

### **🌊 HyperZone (`/hyperzone`)**
- **Funding Rate Simulation**: Hyperliquid perps yield simulation
- **Dynamic APY**: Base APY + funding rate calculations
- **Allocation Controls**: Slider for strategy allocation percentage
- **Growth Projections**: Line charts showing potential returns
- **Coming Soon**: Visual simulation for future features

### **📋 Transaction History (`/history`)**
- **Complete Log**: All deposits, withdrawals, and rebalances
- **Filter Options**: By type, date, protocol, and amount
- **Arbiscan Integration**: Direct links to blockchain transactions
- **Export Functionality**: Download transaction data

### **🔔 Notifications (`/notifications`)**
- **Real-time Updates**: Live transaction status updates
- **Email Integration**: Automated email notifications
- **Status Tracking**: Pending, confirmed, and failed transactions
- **Customization**: Email preferences and notification types

### **👤 Profile (`/profile`)**
- **Email Management**: Add/update email for notifications
- **Transaction Preferences**: Customize notification settings
- **Account Settings**: Wallet connection and preferences
- **Test Features**: Email testing and system diagnostics

### **⚖️ Rebalancing (`/rebalancing`)**
- **Manual Rebalancing**: Force rebalance with preview
- **Opportunity Detection**: Automatic rebalance opportunity alerts
- **History Tracking**: Complete rebalancing history
- **Performance Metrics**: Rebalancing impact analysis

### **💸 Withdraw (`/withdraw`)**
- **Withdrawal Form**: Secure withdrawal with preview
- **Amount Validation**: Balance and allowance checks
- **Confirmation Flow**: Multi-step withdrawal process
- **Transaction Tracking**: Real-time status updates

## 🔧 Project Structure

```
vesto/
├── app/                         # Next.js App Router
│   ├── (pages)/                # Route pages
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Portfolio dashboard
│   │   ├── hyperzone/          # Hyperliquid simulation
│   │   ├── history/            # Transaction history
│   │   ├── notifications/       # Notification center
│   │   ├── profile/            # User profile
│   │   ├── rebalancing/        # Rebalancing interface
│   │   └── withdraw/           # Withdrawal page
│   ├── api/                    # API routes
│   │   ├── protocols/          # Protocol data endpoints
│   │   ├── platform-stats/     # Platform statistics
│   │   ├── email/              # Email notification service
│   │   ├── rebalancing/        # Rebalancing operations
│   │   └── hyperliquid/        # Hyperliquid integration
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/                  # Reusable components
│   ├── ui/                     # Shadcn/ui components
│   ├── deposit-form-v3.tsx     # Deposit form with approval
│   ├── withdraw-form-v3.tsx    # Withdrawal form
│   ├── hyperzone.tsx           # Hyperliquid simulation
│   ├── protocols-showcase.tsx  # Protocol display
│   ├── simulation-mode.tsx     # Portfolio simulation
│   ├── email-settings.tsx      # Email configuration
│   └── site-header.tsx         # Navigation header
├── hooks/                       # Custom React hooks
│   ├── useYieldAggregatorV2.ts # Smart contract interactions
│   ├── useProtocolData.ts       # Protocol data fetching
│   ├── usePlatformStats.ts     # Platform statistics
│   ├── useEmailPreferences.ts   # Email management
│   └── useOnChainData.ts       # On-chain data hooks
├── lib/                         # Utilities and configurations
│   ├── contracts.ts            # Contract addresses and ABIs
│   ├── email.ts                # Email service configuration
│   ├── mongodb.ts              # Database connection
│   ├── types.ts                # TypeScript definitions
│   └── wagmi.ts                # Wagmi configuration
├── providers/                   # Context providers
│   ├── wallet-provider.tsx     # Wallet connection
│   ├── web3-provider.tsx       # Web3 context
│   └── query-provider.tsx      # TanStack Query
├── store/                       # Zustand stores
│   ├── use-app-store.ts        # Global app state
│   ├── use-email-store.ts      # Email preferences
│   └── use-wallet-store.ts     # Wallet state
├── public/                      # Static assets
│   ├── placeholder-logo.svg     # Brand assets
│   └── abstract-geometric-shapes.png
├── EMAIL_SETUP.md               # Email configuration guide
├── env.example                  # Environment template
├── setup-env.sh                # Environment setup script
├── package.json                 # Frontend dependencies
└── tsconfig.json               # TypeScript configuration
```

## 📧 Email System

### **Configuration**
- **Environment Variables**: Secure credential management
- **Gmail Integration**: App password authentication
- **Template System**: HTML email templates with Arbitrum branding
- **Delivery Tracking**: Message ID logging and error handling

### **Email Types**
- **Deposit Confirmation**: Transaction details and receipt tokens
- **Withdrawal Confirmation**: Amount and protocol information
- **Rebalance Notification**: Old/new protocol and APY changes
- **Test Emails**: System verification and debugging

### **Setup Guide**
See `EMAIL_SETUP.md` for detailed configuration instructions.

## 🔒 Security Features

### **Frontend Security**
- **Input Validation**: Client-side validation with Zod schemas
- **XSS Protection**: Sanitized user inputs and safe HTML rendering
- **CSRF Protection**: Secure API endpoints with proper headers
- **Environment Variables**: Sensitive data in server-side only

### **Web3 Security**
- **Wallet Validation**: Proper wallet connection verification
- **Transaction Validation**: Amount and allowance checks
- **Error Handling**: Graceful failure with user feedback
- **Arbiscan Integration**: Transaction verification and transparency

## 🚀 Deployment

### **Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
npm run start
```

### **Environment Variables**
Ensure all required environment variables are set in production:
- Contract addresses
- Database connection
- Email credentials
- WalletConnect project ID

## 📊 Contract Addresses

### **Core Contracts (Arbitrum Sepolia)**
- **YieldAggregator**: `0x4029d4e11e6C13e6Af93602475B505e32CA5B4E6`
- **YieldRouter**: `0xE7cbBF5098997e6eD3c62d39f975086fc064798b`
- **ReceiptToken (aYRT)**: `0xAA465854a489e012096995332916CAe98E02ba0c`

### **Mock Contracts (Testing)**
- **MockAsset (mUSDC)**: `0x68f72646Cbf2ECF4c0d270Ced126aF13ed93584B`
- **MockVault1**: `0xBaf7Dd10B229615246a37CBD595fc2fdD2CD8a8e`
- **MockVault2**: `0x54FA761eB183feD9809cf06A97cd273b39ACE25c`

### **🔗 Blockchain Explorer Links**
- **YieldRouter**: [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/address/0xE7cbBF5098997e6eD3c62d39f975086fc064798b)
- **YieldAggregator**: [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/address/0x4029d4e11e6C13e6Af93602475B505e32CA5B4E6)
- **ReceiptToken**: [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/address/0xAA465854a489e012096995332916CAe98E02ba0c)

## 🔗 Related Repositories

### **Smart Contracts Repository**
- **GitHub**: [https://github.com/harshdev2909/yield-router](https://github.com/harshdev2909/yield-router)
- **Purpose**: Solidity contracts, tests, deployment scripts
- **Network**: Arbitrum Sepolia Testnet

### **This Frontend Repository**
- **GitHub**: [https://github.com/harshdev2909/vesto](https://github.com/harshdev2909/vesto)
- **Purpose**: Next.js frontend, React components, API routes
- **Live Demo**: [http://localhost:3000](http://localhost:3000) (when running locally)

## 🎨 UI/UX Features

### **Design System**
- **Consistent Theming**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Accessibility**: WCAG compliant with keyboard navigation
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Graceful error states with retry options

### **Animations**
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Chart Animations**: Dynamic data visualization
- **Loading Animations**: Engaging loading states
- **Hover Effects**: Interactive element feedback

### **User Experience**
- **Real-time Updates**: Live data synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Offline Support**: Graceful degradation
- **Performance**: Optimized bundle size and loading

## 📊 Monitoring & Analytics

### **Performance Metrics**
- **Core Web Vitals**: LCP, FID, CLS optimization
- **Bundle Analysis**: Optimized JavaScript bundles
- **API Performance**: Response time monitoring
- **Error Tracking**: Client-side error reporting

### **User Analytics**
- **Transaction Tracking**: Deposit/withdrawal patterns
- **Feature Usage**: Component interaction analytics
- **Performance Monitoring**: Real-time performance metrics
- **User Journey**: Complete user flow analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This software is for educational and testing purposes. Use at your own risk. The authors are not responsible for any financial losses.

## 🆘 Support

For questions or issues:
- Open a GitHub issue
- Check the component files for usage examples
- Review the API routes for implementation details

---

**🌐 Modern, responsive frontend for yield aggregation on Arbitrum!**

**🎨 Beautiful UI/UX with comprehensive features and real-time updates!**
