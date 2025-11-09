import { Question } from '@/domain/forum/enterprise/entities/question'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import type { QuestionsRepository } from '../repositories/questions-repository'

interface GetQuestionBySlugUseCaseRequest {
  slug: string
}

interface GetQuestionBySlugUseCaseResponse {
  question: Question
}

export class GetQuestionBySlugUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async exec({
    slug
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    
    const question = await this.questionsRepository.findBySlug(slug)

    if(!question) {
        throw new Error("Question not found")
    }

    return {
      question
    }
  }
}
