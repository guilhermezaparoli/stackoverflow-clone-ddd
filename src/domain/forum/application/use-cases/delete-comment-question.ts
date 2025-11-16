import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'

interface DeleteCommentQuestionUseCaseRequest {
  authorId: string
  commentId: string
}

interface DeleteCommentQuestionUseCaseResponse {}

export class DeleteCommentQuestionUseCase {
  constructor(private commentQuestionsRepository: QuestionCommentsRepository) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentQuestionUseCaseRequest): Promise<DeleteCommentQuestionUseCaseResponse> {
    const questionComment =
      await this.commentQuestionsRepository.findById(commentId)

    if (!questionComment) {
      throw new Error('Comment not found.')
    }

    if (authorId !== questionComment.authorId.toString()) {
      throw new Error('Not allowed.')
    }

    await this.commentQuestionsRepository.delete(questionComment)

    return {}
  }
}
