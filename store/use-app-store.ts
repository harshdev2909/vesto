import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  walletAddress: string | null
  email: string | null
  isConnected: boolean
}

interface AppState {
  // User state
  user: User
  setUser: (user: Partial<User>) => void
  clearUser: () => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Transaction state
  pendingTransactions: Record<string, {
    hash: string
    type: 'deposit' | 'withdraw' | 'rebalance'
    status: 'pending' | 'confirmed' | 'failed'
    timestamp: number
  }>
  addPendingTransaction: (hash: string, type: 'deposit' | 'withdraw' | 'rebalance') => void
  updateTransactionStatus: (hash: string, status: 'confirmed' | 'failed') => void
  removePendingTransaction: (hash: string) => void
  
  // Notification state
  notifications: Array<{
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    timestamp: number
    read: boolean
  }>
  unreadCount: number
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  setNotifications: (notifications: AppState['notifications']) => void
  setUnreadCount: (count: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: {
        walletAddress: null,
        email: null,
        isConnected: false,
      },
      setUser: (user) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),
      clearUser: () =>
        set({
          user: {
            walletAddress: null,
            email: null,
            isConnected: false,
          },
        }),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Transaction state
      pendingTransactions: {},
      addPendingTransaction: (hash, type) =>
        set((state) => ({
          pendingTransactions: {
            ...state.pendingTransactions,
            [hash]: {
              hash,
              type,
              status: 'pending',
              timestamp: Date.now(),
            },
          },
        })),
      updateTransactionStatus: (hash, status) =>
        set((state) => ({
          pendingTransactions: {
            ...state.pendingTransactions,
            [hash]: {
              ...state.pendingTransactions[hash],
              status,
            },
          },
        })),
      removePendingTransaction: (hash) =>
        set((state) => {
          const { [hash]: removed, ...rest } = state.pendingTransactions
          return { pendingTransactions: rest }
        }),

      // Notification state
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          }
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }
        }),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),
      setUnreadCount: (count) => set({ unreadCount: count }),
    }),
    {
      name: 'vesto-app-store',
      partialize: (state) => ({
        user: state.user,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
)
