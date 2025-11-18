import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { QuestionComment } from '../../enterprise/entities/question-comment'
import type { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import { right, type Either } from '@/core/either'

interface FetchQuestionCommentsUseCaseRequest extends PaginationParams {
  questionId: string
}

type FetchQuestionCommentsUseCaseResponse = Either<
  null,
  {
    questioncomments: QuestionComment[]
  }
>

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

    return right({
      questioncomments,
    })
  }
}
