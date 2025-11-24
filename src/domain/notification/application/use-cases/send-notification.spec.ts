import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { SendNotificationUseCase } from './send-notification'
import { makeNotification } from 'test/factories/make-notification'

let notificationsRepository: InMemoryNotificationsRepository

let sut: SendNotificationUseCase

describe('Send notification Use Case', () => {
  beforeEach(() => {
    notificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(notificationsRepository)
  })

  it('should be able to create a notification', async () => {
    const result = await sut.exec({
      content: 'notification content',
      title: 'notification title',
      recipientId: '123',
    })

    expect(result.isRight()).toBe(true)
    expect(notificationsRepository.items[0]).toEqual(result.value?.notification)
  })
})
