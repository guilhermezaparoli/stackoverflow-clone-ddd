import { left, right, type Either } from '@/core/either'
import type { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

interface DeleteCommentAnswerUseCaseRequest {
  authorId: string
  commentId: string
}

type DeleteCommentAnswerUseCaseResponse = Either<string, {}>

export class DeleteCommentAnswerUseCase {
  constructor(private commentAnswersRepository: AnswerCommentsRepository) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentAnswerUseCaseRequest): Promise<DeleteCommentAnswerUseCaseResponse> {
    const answerComment =
      await this.commentAnswersRepository.findById(commentId)

    if (!answerComment) {
      return left('Comment not found.')
    }

    if (authorId !== answerComment.authorId.toString()) {
      return left('Not allowed.')
    }

    await this.commentAnswersRepository.delete(answerComment)

    return right({})
  }
}
