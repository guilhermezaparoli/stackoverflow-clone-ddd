import type { NotificationsRepository } from "@/domain/notification/application/repositories/notifications-repository";
import type { Notification } from "@/domain/notification/enterprise/entities/notification";

export class InMemoryNotificationsRepository implements NotificationsRepository {

    public items: Notification[] = []

    async create(notification: Notification): Promise<Notification> {

        this.items.push(notification)

        return notification
    }

    async findById(notificationId: string): Promise<Notification | null> {
        const notification = this.items.find(item => item.id.toString() === notificationId)

        if (!notification) {
            return null
        }

        return notification
    }

    async save(notification: Notification): Promise<Notification> {
        const itemIndex = this.items.findIndex((item) => item.id === notification.id)

        this.items[itemIndex] = notification

        return notification
    }
}