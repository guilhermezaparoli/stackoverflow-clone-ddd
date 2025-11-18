import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionComment } from '../../enterprise/entities/question-comment'
import type { QuestionsRepository } from '../repositories/questions-repository'
import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import { left, right, type Either } from '@/core/either'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CommentOnQuestionUsecaseRequest {
  content: string
  authorId: string
  questionId: string
}
type CommentOnQuestionUsecaseResponse = Either<
  ResourceNotFoundError,
  {
    questionComment: QuestionComment
  }
>

export class CommentOnQuestionUsecase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionCommentsRepository: QuestionCommentsRepository,
  ) {}

  async exec({
    authorId,
    content,
    questionId,
  }: CommentOnQuestionUsecaseRequest): Promise<CommentOnQuestionUsecaseResponse> {
    const question = this.questionsRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    const questionComment = QuestionComment.create({
      authorId: new UniqueEntityID(authorId),
      questionId: new UniqueEntityID(questionId),
      content,
    })

    await this.questionCommentsRepository.create(questionComment)

    return right({
      questionComment,
    })
  }
}
