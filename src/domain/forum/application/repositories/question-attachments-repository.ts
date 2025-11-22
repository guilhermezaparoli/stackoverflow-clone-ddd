import type { QuestionAttachment } from '../../enterprise/entities/question-attachment'

export interface QuestionAttachmentsRepository {
  findManyByQuestionId(id: string): Promise<QuestionAttachment[]>
}
