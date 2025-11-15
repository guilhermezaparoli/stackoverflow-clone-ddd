import type { AnswerComment } from '../../enterprise/entities/answer-comment'

export interface AnswerCommentsRepository {
  create(AnswerComment: AnswerComment): Promise<void>
}
