import { DomainEvents } from '@/core/events/domain-events'
import type { EventHandler } from '@/core/events/event-handler'
import { AnswerCommentCreatedEvent } from '@/domain/forum/enterprise/events/asnwer-comment-created-event'
import type { SendNotificationUseCase } from '../use-cases/send-notification'
import type { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'

export class OnAnswerCommentCreated implements EventHandler {
  constructor(
    private answerRepository: AnswersRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendAnswerCommentCreatedNotification.bind(this),
      AnswerCommentCreatedEvent.name,
    )
  }

  private async sendAnswerCommentCreatedNotification({
    answerComment,
  }: AnswerCommentCreatedEvent) {
    const answer = await this.answerRepository.findById(
      answerComment.answerId.toString(),
    )

    if (answer) {
      await this.sendNotification.exec({
        recipientId: answer.authorId.toString(),
        title: 'Sua resposta recebeu um novo comentário',
        content: answerComment.content.substring(0, 40).concat('...'),
      })
    }
  }
}
