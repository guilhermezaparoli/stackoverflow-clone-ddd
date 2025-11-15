import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerComment } from '../../enterprise/entities/answer-comment'
import type { AnswersRepository } from '../repositories/answers-repository'
import type { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

interface CommentOnAnswerUsecaseRequest {
  content: string
  authorId: string
  answerId: string
}
interface CommentOnAnswerUsecaseResponse {
  answerComment: AnswerComment
}

export class CommentOnAnswerUsecase {
  constructor(
    private answersRepository: AnswersRepository,
    private answerCommentsRepository: AnswerCommentsRepository,
  ) {}

  async exec({
    authorId,
    content,
    answerId,
  }: CommentOnAnswerUsecaseRequest): Promise<CommentOnAnswerUsecaseResponse> {
    const answer = this.answersRepository.findById(answerId)

    if (!answer) {
      throw new Error('Answer not found.')
    }

    const answerComment = AnswerComment.create({
      authorId: new UniqueEntityID(authorId),
      answerId: new UniqueEntityID(answerId),
      content,
    })

    await this.answerCommentsRepository.create(answerComment)

    return {
      answerComment,
    }
  }
}
