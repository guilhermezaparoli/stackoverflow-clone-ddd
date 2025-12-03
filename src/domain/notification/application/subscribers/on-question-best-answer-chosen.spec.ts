import { makeAnswer } from "test/factories/make-answer"
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository"
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments-repository"
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository"
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository"
import { SendNotificationUseCase } from "../use-cases/send-notification"
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"
import { makeQuestion } from "test/factories/make-question"
import { vi} from "vitest"
import { waitFor } from "test/utils/wait-for"
import { OnQuestionBestAnswerChosen } from "./on-question-best-answer-chosen"

let answersRepository: InMemoryAnswersRepository 
let answersAttachmentRepository: InMemoryAnswerAttachmentsRepository
let questionsRepository: InMemoryQuestionsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sendNotificationUseCase: SendNotificationUseCase
let notificationsRepository: InMemoryNotificationsRepository

let sendNotificationExecuteSpy: any;

describe('On Question Best Answer Chosen', () => {

    beforeEach(() => {
        questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
        questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository)
        answersAttachmentRepository = new InMemoryAnswerAttachmentsRepository()
        answersRepository = new InMemoryAnswersRepository(answersAttachmentRepository)
        notificationsRepository = new InMemoryNotificationsRepository()
        sendNotificationUseCase = new SendNotificationUseCase(notificationsRepository)

        sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, "exec")

        new OnQuestionBestAnswerChosen(answersRepository, sendNotificationUseCase)
    })

    it('should send a notification when a question have a best answer chosen', async () => {

        const question = makeQuestion()
        const answer = makeAnswer({
            questionId: question.id
        })

        questionsRepository.create(question)
        answersRepository.create(answer)

        question.bestAnswerId = answer.id

        questionsRepository.save(question)

        await waitFor(() => {
            expect(sendNotificationExecuteSpy).toHaveBeenCalled()
        })

    })
})