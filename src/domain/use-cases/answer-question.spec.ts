import { AnswerQuestionUseCase } from "./answer-question"
import type { AnswersRepository } from "../repositories/answers-repository"

const fakeAnwersRepository: AnswersRepository = {
    create: async (answer) => {
        return 
    },
}
test('create an answer', async () => {
    const answerQuestion = new AnswerQuestionUseCase(fakeAnwersRepository)

    const answer = await answerQuestion.exec({
        content: "Nova resposta",
        instructorId: "1",
        questionId: "1"
    })

    expect(answer.content).toEqual('Nova resposta')
})