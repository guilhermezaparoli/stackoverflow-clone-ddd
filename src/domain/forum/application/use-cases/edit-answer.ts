import { Answer } from '@/domain/forum/enterprise/entities/answer'
import type { AnswersRepository } from '../repositories/answers-repository'

interface EditAnswerUseCaseRequest {
  authorId: string
  content: string
  answerId: string
}

interface EditAnswerUseCaseResponse {
  answer: Answer
}

export class EditAnswerUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async exec({
    authorId,
    content,
    answerId
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)
 
    if(!answer){
      throw new Error('Answer not found')
    }

    if(answer.authorId.toString() !== authorId){
      throw new Error('You are not allowed to edit this answer')
    }

    answer.content = content

    await this.answersRepository.save(answer)

    return {
      answer,
    }
  }
}
