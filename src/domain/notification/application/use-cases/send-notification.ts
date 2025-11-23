import { right, type Either } from '@/core/either'
import { Notification } from '../../enterprise/entities/notification'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import type { NotificationsRepository } from '../repositories/notifications-repository'

interface SendNotificationUseCaseRequest {
  title: string
  content: string
  recipientId: string
}

type SendNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

export class SendNotificationUseCase {
  constructor(
    private notificationsRepository: NotificationsRepository
  ) {}

  async exec({
    content,
    recipientId,
    title,
  }: SendNotificationUseCaseRequest): Promise<SendNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityID(recipientId),
      content,
      title,
    })

   await this.notificationsRepository.create(notification)

    return right({
      notification,
    })
  }
}
