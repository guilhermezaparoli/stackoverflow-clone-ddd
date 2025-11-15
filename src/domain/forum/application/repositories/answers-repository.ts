import type { PaginationParams } from '@/core/repositories/pagination-params'
import type { Answer } from '../../enterprise/entities/answer'

export interface AnswersRepository {
  create(answer: Answer): Promise<void>
  save(answer: Answer): Promise<Answer>
  findById(id: string): Promise<Answer | null>
  delete(answer: Answer): Promise<void>
  findManyByQuestionId(id: string, params: PaginationParams): Promise<Answer[]>
}
