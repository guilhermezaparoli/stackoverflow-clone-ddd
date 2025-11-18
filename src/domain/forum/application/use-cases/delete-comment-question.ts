import { left, right, type Either } from '@/core/either'
import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from './errors/not-allowed-error'

interface DeleteCommentQuestionUseCaseRequest {
  authorId: string
  commentId: string
}

type DeleteCommentQuestionUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {}
>

export class DeleteCommentQuestionUseCase {
  constructor(private commentQuestionsRepository: QuestionCommentsRepository) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentQuestionUseCaseRequest): Promise<DeleteCommentQuestionUseCaseResponse> {
    const questionComment =
      await this.commentQuestionsRepository.findById(commentId)

    if (!questionComment) {
      return left(new ResourceNotFoundError())
    }

    if (authorId !== questionComment.authorId.toString()) {
      return left(new NotAllowedError())
    }

    await this.commentQuestionsRepository.delete(questionComment)

    return right({})
  }
}
