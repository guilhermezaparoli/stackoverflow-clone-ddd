import type { AnswersRepository } from '../repositories/answers-repository'
import type { Answer } from '../../enterprise/entities/answer'
import type { PaginationParams } from '@/core/repositories/pagination-params'

interface FetchQuestionAnswersUseCaseRequest extends PaginationParams {
  questionId: string
}

interface FetchQuestionAnswersUseCaseResponse {
  answers: Answer[]
}

export class FetchQuestionAnswersUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async exec({
    questionId,
    page = 1,
    pageSize = 20,
  }: FetchQuestionAnswersUseCaseRequest): Promise<FetchQuestionAnswersUseCaseResponse> {
    const answers = await this.answersRepository.findManyByQuestionId(
      questionId,
      {
        page,
        pageSize,
      },
    )

    return {
      answers,
    }
  }
}
