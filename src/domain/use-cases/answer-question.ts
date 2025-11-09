import { UniqueEntityID } from "../../core/entities/unique-entity-id";
import { Answer } from "../entities/answer";
import type { AnswersRepository } from "../repositories/answers-repository";

interface AnswerQuestionRequest {
    instructorId: string
    questionId: string
    content: string
}

export class AnswerQuestionUseCase {

    constructor(private answersRepository: AnswersRepository) { }
    async exec({ instructorId, questionId, content }: AnswerQuestionRequest) {
        const answer =  Answer.create({
            authorId: new UniqueEntityID(instructorId),
            content,
            questionId: new UniqueEntityID(questionId)
        })

        await this.answersRepository.create(answer)

        return answer
    }
}