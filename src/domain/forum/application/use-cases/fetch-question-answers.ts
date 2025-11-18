import type { AnswersRepository } from '../repositories/answers-repository'
import type { Answer } from '../../enterprise/entities/answer'
import type { PaginationParams } from '@/core/repositories/pagination-params'
import { right, type Either } from '@/core/either'

interface FetchQuestionAnswersUseCaseRequest extends PaginationParams {
  questionId: string
}

type FetchQuestionAnswersUseCaseResponse = Either<
  null,
  {
    answers: Answer[]
  }
>

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

    return right({
      answers,
    })
  }
}
