import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'

interface DeleteCommentQuestionUseCaseRequest {
  authorId: string
  commentId: string
}

export class DeleteCommentQuestionUseCase {
  constructor(
    private commentQuestionsRepository: QuestionCommentsRepository,
  ) {}

  async exec({
    authorId,
    commentId,
  }: DeleteCommentQuestionUseCaseRequest): Promise<void> {
    const comment = await this.commentQuestionsRepository.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (authorId !== comment.authorId.toString()) {
      throw new Error('Not allowed.')
    }

    await this.commentQuestionsRepository.delete(comment)
  }
}
