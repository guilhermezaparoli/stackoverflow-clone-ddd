import type { AnswerCommentsRepository } from '../repositories/answer-comments-repository'

interface DeleteCommentAnswerUseCaseRequest {
  authorId: string
  commentId: string
}

interface DeleteCommentAnswerUseCaseResponse {}

export class DeleteCommentAnswerUseCase {
  constructor(private commentAnswersRepository: AnswerCommentsRepository) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentAnswerUseCaseRequest): Promise<DeleteCommentAnswerUseCaseResponse> {
    const answerComment =
      await this.commentAnswersRepository.findById(commentId)

    if (!answerComment) {
      throw new Error('Comment not found.')
    }

    if (authorId !== answerComment.authorId.toString()) {
      throw new Error('Not allowed.')
    }

    await this.commentAnswersRepository.delete(answerComment)

    return {}
  }
}
