import { Question } from '@/domain/forum/enterprise/entities/question'
import type { QuestionsRepository } from '../repositories/questions-repository'
import type { AnswersRepository } from '../repositories/answers-repository'


interface ChooseQuestionBestAnswerUseCaseRequest {
  answerId: string
  authorId: string
}
 
interface ChooseQuestionBestAnswerUseCaseResponse {
  question: Question
}

export class ChooseQuestionBestAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private questionsRepository: QuestionsRepository) {}

  async exec({
    answerId,
    authorId
  }: ChooseQuestionBestAnswerUseCaseRequest): Promise<ChooseQuestionBestAnswerUseCaseResponse> {
    const answer = await  this.answersRepository.findById(answerId)

    if(!answer) {
        throw new Error("Answer not found")
    }
    
    const question = await this.questionsRepository.findById(answer?.questionId.toString())
 
    if(!question){
      throw new Error('Question not found')
    }

    if(question.authorId.toString() !== authorId){
      throw new Error('You are not allowed to edit this question')
    }

    question.bestAnswerId = answer.id

    await this.questionsRepository.save(question)

    return {
      question,
    }
  }
}
