import { getCollection } from './db'
import { Notification, HistoryEntry, User } from './types'

// Notification operations
export async function createNotification(notification: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
  const collection = await getCollection<Notification>('notifications')
  const now = new Date()
  const newNotification: Notification = {
    ...notification,
    walletAddress: notification.walletAddress.toLowerCase(),
    timestamp: now,
    read: false,
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newNotification)
  return { ...newNotification, _id: result.insertedId.toString() }
}

export async function getNotifications(walletAddress: string, unreadOnly: boolean = false): Promise<Notification[]> {
  const collection = await getCollection<Notification>('notifications')
  const query: any = { walletAddress: walletAddress.toLowerCase() }
  if (unreadOnly) {
    query.read = false
  }
  return collection.find(query).sort({ timestamp: -1 }).toArray()
}

export async function getUnreadNotificationCount(walletAddress: string): Promise<number> {
  const collection = await getCollection<Notification>('notifications')
  return collection.countDocuments({
    walletAddress: walletAddress.toLowerCase(),
    read: false
  })
}

export async function markNotificationAsRead(notificationId: string, walletAddress: string): Promise<boolean> {
  const collection = await getCollection<Notification>('notifications')
  const result = await collection.updateOne(
    { 
      _id: notificationId,
      walletAddress: walletAddress.toLowerCase()
    },
    { 
      $set: { 
        read: true,
        updatedAt: new Date()
      }
    }
  )
  return result.modifiedCount > 0
}

export async function markAllNotificationsAsRead(walletAddress: string): Promise<number> {
  const collection = await getCollection<Notification>('notifications')
  const result = await collection.updateMany(
    { 
      walletAddress: walletAddress.toLowerCase(),
      read: false
    },
    { 
      $set: { 
        read: true,
        updatedAt: new Date()
      }
    }
  )
  return result.modifiedCount
}

// History operations
export async function createHistoryEntry(entry: Omit<HistoryEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<HistoryEntry> {
  const collection = await getCollection<HistoryEntry>('history')
  const now = new Date()
  const newEntry: HistoryEntry = {
    ...entry,
    walletAddress: entry.walletAddress.toLowerCase(),
    assetAddress: entry.assetAddress?.toLowerCase(),
    protocolAddress: entry.protocolAddress?.toLowerCase(),
    timestamp: now,
    read: false,
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newEntry)
  return { ...newEntry, _id: result.insertedId.toString() }
}

export async function getHistoryEntries(walletAddress: string): Promise<HistoryEntry[]> {
  const collection = await getCollection<HistoryEntry>('history')
  return collection.find({ 
    walletAddress: walletAddress.toLowerCase() 
  }).sort({ timestamp: -1 }).toArray()
}

// User operations
export async function createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const collection = await getCollection<User>('users')
  const now = new Date()
  const newUser: User = {
    ...user,
    walletAddress: user.walletAddress.toLowerCase(),
    createdAt: now,
    updatedAt: now
  }
  const result = await collection.insertOne(newUser)
  return { ...newUser, _id: result.insertedId.toString() }
}

export async function getUser(walletAddress: string): Promise<User | null> {
  const collection = await getCollection<User>('users')
  return collection.findOne({ 
    walletAddress: walletAddress.toLowerCase() 
  })
}

export async function updateUser(walletAddress: string, updates: Partial<User>): Promise<boolean> {
  const collection = await getCollection<User>('users')
  const result = await collection.updateOne(
    { walletAddress: walletAddress.toLowerCase() },
    { 
      $set: { 
        ...updates,
        updatedAt: new Date()
      }
    }
  )
  return result.modifiedCount > 0
}
