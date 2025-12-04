import type { DomainEvent } from '@/core/events/domain-event'
import type { AnswerComment } from '../entities/answer-comment'
import type { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class AnswerCommentCreatedEvent implements DomainEvent {
  ocurredAt: Date
  answerComment: AnswerComment

  constructor(answerComment: AnswerComment) {
    this.answerComment = answerComment
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.answerComment.id
  }
}
