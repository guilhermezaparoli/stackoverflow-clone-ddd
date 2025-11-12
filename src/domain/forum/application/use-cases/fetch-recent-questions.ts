import { Question } from '@/domain/forum/enterprise/entities/question'
import type { QuestionsRepository } from '../repositories/questions-repository'
import type { PaginationParams } from '@/core/repositories/pagination-params'

interface FetchRecentQuestionsUseCaseRequest extends PaginationParams {
}

interface FetchRecentQuestionsUseCaseResponse {
  questions: Question[]
}

export class FetchRecentQuestionsUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async exec({
    page = 1,
    pageSize = 20
  }: FetchRecentQuestionsUseCaseRequest): Promise<FetchRecentQuestionsUseCaseResponse> {
    
    const questions = await this.questionsRepository.findManyRecent({
      page,
      pageSize
    })

    return {
      questions
    }
  }
}
