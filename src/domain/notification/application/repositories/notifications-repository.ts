import type { Notification } from '../../enterprise/entities/notification'

export interface NotificationsRepository {
  create(notification: Notification): Promise<Notification>
  save(notification: Notification): Promise<Notification>
  findById(notificationId: string): Promise<Notification | null>
}
