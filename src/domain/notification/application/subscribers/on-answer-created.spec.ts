import { makeAnswer } from "test/factories/make-answer"
import { OnAnswerCreated } from "./on-asnwer-created"
import { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository"
import { InMemoryAnswerAttachmentsRepository } from "test/repositories/in-memory-answer-attachments-repository"
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository"
import { InMemoryQuestionAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository"
import { SendNotificationUseCase } from "../use-cases/send-notification"
import { InMemoryNotificationsRepository } from "test/repositories/in-memory-notifications-repository"
import { makeQuestion } from "test/factories/make-question"
import { vi} from "vitest"
import { waitFor } from "test/utils/wait-for"

let answersRepository: InMemoryAnswersRepository 
let answersAttachmentRepository: InMemoryAnswerAttachmentsRepository
let questionsRepository: InMemoryQuestionsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sendNotificationUseCase: SendNotificationUseCase
let notificationsRepository: InMemoryNotificationsRepository

let sendNotificationExecuteSpy: any;

describe('On Answer Created', () => {

    beforeEach(() => {
        questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
        questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository)
        answersAttachmentRepository = new InMemoryAnswerAttachmentsRepository()
        answersRepository = new InMemoryAnswersRepository(answersAttachmentRepository)
        notificationsRepository = new InMemoryNotificationsRepository()
        sendNotificationUseCase = new SendNotificationUseCase(notificationsRepository)

        sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, "exec")

        new OnAnswerCreated(questionsRepository, sendNotificationUseCase)
    })

    it('should send a notification when an answer is created', async () => {

        const question = makeQuestion()
        const answer = makeAnswer({
            questionId: question.id
        })

        questionsRepository.create(question)
        answersRepository.create(answer)


        await waitFor(() => {
            expect(sendNotificationExecuteSpy).toHaveBeenCalled()
        })

    })
})