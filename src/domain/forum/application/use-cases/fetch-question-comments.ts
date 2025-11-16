import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { QuestionComment } from '../../enterprise/entities/question-comment'
import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'

interface FetchQuestionCommentsUseCaseRequest extends PaginationParams {
  questionId: string
}

interface FetchQuestionCommentsUseCaseResponse {
  questioncomments: QuestionComment[]
}

export class FetchQuestionCommentsUseCase {
  constructor(private questioncommentsRepository: QuestionCommentsRepository) {}

  async exec({
    questionId,
    page = 1,
    pageSize = 20,
  }: FetchQuestionCommentsUseCaseRequest): Promise<FetchQuestionCommentsUseCaseResponse> {
    const questioncomments =
      await this.questioncommentsRepository.findManyByQuestionId(questionId, {
        page,
        pageSize,
      })

    return {
      questioncomments,
    }
  }
}
