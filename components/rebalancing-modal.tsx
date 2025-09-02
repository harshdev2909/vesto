"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useSmartContractRebalancing } from "@/hooks/useSmartContractRebalancing"

interface RebalancingModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity: {
    assetSymbol: string
    currentProtocolName: string
    bestProtocolName: string
    currentAPY: number
    bestAPY: number
    improvement: number
    assetAddress: string
    currentProtocol: string
    bestProtocol: string
  }
  onSuccess: () => void
}

type RebalancingStep = 'preparing' | 'approving' | 'executing' | 'confirming' | 'completed' | 'failed'

export function RebalancingModal({ isOpen, onClose, opportunity, onSuccess }: RebalancingModalProps) {
  const [currentStep, setCurrentStep] = useState<RebalancingStep>('preparing')
  const [progress, setProgress] = useState(0)
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  const { rebalance, isRebalancing, currentStep: smartContractStep } = useSmartContractRebalancing()

  // Auto-start rebalancing when modal opens
  useEffect(() => {
    console.log('=== Auto-start effect triggered ===')
    console.log('Effect state:', { isOpen, hasStarted, isProcessing })
    
    if (isOpen && !hasStarted && !isProcessing) {
      console.log('Modal opened, starting rebalancing...')
      setHasStarted(true)
      // Use setTimeout to ensure the modal is fully rendered
      setTimeout(() => {
        console.log('Auto-start timeout triggered, calling handleRebalance')
        handleRebalance()
      }, 100)
    }
  }, [isOpen]) // Removed hasStarted from dependencies to prevent loops

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('preparing')
      setProgress(0)
      setTransactionHash('')
      setError('')
      setIsProcessing(false)
      setHasStarted(false)
    }
  }, [isOpen])

  const steps = [
    { key: 'preparing', label: 'Preparing Rebalancing', description: 'Validating parameters and checking balances' },
    { key: 'approving', label: 'Approving Transaction', description: 'Signing transaction in your wallet' },
    { key: 'executing', label: 'Executing Rebalancing', description: 'Moving funds to optimal protocol' },
    { key: 'confirming', label: 'Confirming Transaction', description: 'Waiting for blockchain confirmation' },
    { key: 'completed', label: 'Rebalancing Complete', description: 'Successfully moved to higher yield protocol' }
  ]

  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  const formatAPY = (apy: number) => (apy / 100).toFixed(2) + '%'

  const handleRebalance = async () => {
    console.log('=== handleRebalance called ===')
    console.log('Current state:', { isProcessing, hasStarted, currentStep })
    
    // Prevent multiple simultaneous calls
    if (isProcessing || hasStarted) {
      console.log('Rebalancing already in progress or started, ignoring duplicate call')
      return
    }
    
    setIsProcessing(true)
    setHasStarted(true)
    setError('')
    
    try {
      // Step 1: Preparing
      console.log('Step 1: Preparing...')
      setCurrentStep('preparing')
      setProgress(10)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Approving (simulate wallet interaction)
      console.log('Step 2: Approving...')
      setCurrentStep('approving')
      setProgress(25)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 3: Executing rebalancing via smart contract
      console.log('Step 3: Executing smart contract...')
      setCurrentStep('executing')
      setProgress(50)
      
      // Call smart contract rebalancing
      console.log('Calling rebalance function with:', {
        assetAddress: opportunity.assetAddress,
        fromProtocol: opportunity.currentProtocol,
        toProtocol: opportunity.bestProtocol
      })
      
      const smartContractResult = await rebalance(
        opportunity.assetAddress,
        opportunity.currentProtocol,
        opportunity.bestProtocol
      )
      
      console.log('Smart contract result:', smartContractResult)

      setTransactionHash(smartContractResult.transactionHash)
      setProgress(75)

      // Step 4: Confirming
      console.log('Step 4: Confirming...')
      setCurrentStep('confirming')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProgress(90)

      // Step 5: Update database
      console.log('Step 5: Updating database...')
      const response = await fetch('/api/rebalancing/execute-rebalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetAddress: opportunity.assetAddress,
          fromProtocol: opportunity.currentProtocol,
          toProtocol: opportunity.bestProtocol,
          transactionHash: smartContractResult.transactionHash
        })
      })
      
      const result = await response.json()
      console.log('Database update result:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update database')
      }

      // Step 6: Completed
      console.log('Step 6: Completed!')
      setCurrentStep('completed')
      setProgress(100)
      
      toast.success('Rebalancing completed successfully!')
      onSuccess()
      
      // Don't auto-close, let user manually close to see the success state
      // setTimeout(() => {
      //   onClose()
      // }, 3000)

    } catch (error) {
      console.error('Rebalancing error:', error)
      setCurrentStep('failed')
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to execute rebalancing'
      if (error instanceof Error) {
        if (error.message.includes('Transaction receipt')) {
          errorMessage = 'Transaction is being processed. Please check your wallet or try again in a few minutes.'
        } else if (error.message.includes('Contract not found')) {
          errorMessage = 'Smart contract not deployed. Please contact support.'
        } else if (error.message.includes('gas')) {
          errorMessage = 'Transaction failed due to gas issues. Please try again.'
        } else if (error.message.includes('revert')) {
          errorMessage = 'Transaction reverted. Rebalancing conditions may not be met.'
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was cancelled by user.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      toast.error('Rebalancing failed: ' + errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
    }
  }

  const getStepIcon = (stepKey: string, index: number) => {
    if (stepKey === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />
    }
    
    if (currentStepIndex > index) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    if (currentStepIndex === index && isProcessing) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    }
    
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
  }

  const getStepStatus = (stepKey: string, index: number) => {
    if (stepKey === 'failed') return 'text-red-600'
    if (currentStepIndex > index) return 'text-green-600'
    if (currentStepIndex === index) return 'text-blue-600 font-semibold'
    return 'text-gray-500'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Rebalancing {opportunity.assetSymbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rebalancing Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Rebalancing Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">From Protocol</div>
                <div className="font-semibold">{opportunity.currentProtocolName}</div>
                <div className="text-gray-500">{formatAPY(opportunity.currentAPY)} APY</div>
              </div>
              <div>
                <div className="text-gray-600">To Protocol</div>
                <div className="font-semibold text-green-600">{opportunity.bestProtocolName}</div>
                <div className="text-green-600">{formatAPY(opportunity.bestAPY)} APY</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expected Improvement</span>
                <span className="font-semibold text-green-600">+{formatAPY(opportunity.improvement)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-3">
                {getStepIcon(step.key, index)}
                <div className="flex-1">
                  <div className={`text-sm ${getStepStatus(step.key, index)}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-900">Transaction Hash</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="text-xs bg-white px-2 py-1 rounded border">
                  {transactionHash}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${transactionHash}`, '_blank')}
                  className="h-6 px-2"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-900">Error</span>
              </div>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {currentStep === 'failed' && (
              <Button onClick={handleRebalance} variant="outline">
                Try Again
              </Button>
            )}
            {!isProcessing && (!hasStarted || currentStep === 'failed') && (
              <Button onClick={handleRebalance} className="bg-green-600 hover:bg-green-700">
                {hasStarted ? 'Retry' : 'Start Rebalancing'}
              </Button>
            )}
            <Button 
              onClick={handleClose} 
              variant={currentStep === 'completed' ? 'default' : 'outline'}
              disabled={isProcessing}
            >
              {currentStep === 'completed' ? 'Done' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
