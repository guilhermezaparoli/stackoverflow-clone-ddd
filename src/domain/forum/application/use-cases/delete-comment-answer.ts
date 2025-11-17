import { left, right, type Either } from '@/core/either'
import type { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from './errors/not-allowed-error'

interface DeleteCommentAnswerUseCaseRequest {
  authorId: string
  commentId: string
}

type DeleteCommentAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {}
>

export class DeleteCommentAnswerUseCase {
  constructor(private commentAnswersRepository: AnswerCommentsRepository) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentAnswerUseCaseRequest): Promise<DeleteCommentAnswerUseCaseResponse> {
    const answerComment =
      await this.commentAnswersRepository.findById(commentId)

    if (!answerComment) {
      return left(new ResourceNotFoundError())
    }

    if (authorId !== answerComment.authorId.toString()) {
      return left(new NotAllowedError())
    }

    await this.commentAnswersRepository.delete(answerComment)

    return right({})
  }
}
