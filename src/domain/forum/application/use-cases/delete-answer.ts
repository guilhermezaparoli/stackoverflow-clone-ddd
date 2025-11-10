import type { AnswersRepository } from '../repositories/answers-repository'

interface DeleteAnswerUseCaseRequest {
    authorId: string
    answerId: string
}

interface DeleteAnswerUseCaseResponse {

}

export class DeleteAnswerUseCase {
    constructor(private answersRepository: AnswersRepository) { }

    async exec({
        authorId,
        answerId
    }: DeleteAnswerUseCaseRequest): Promise<DeleteAnswerUseCaseResponse> {
        const answer = await this.answersRepository.findById(answerId)

        if (!answer) {
            throw new Error("answer not found.")
        }

        if(authorId !== answer.authorId.toString()) {
            throw new Error("Not allowed.")
        }

        await this.answersRepository.delete(answer)

        return {

        }

    }
}
