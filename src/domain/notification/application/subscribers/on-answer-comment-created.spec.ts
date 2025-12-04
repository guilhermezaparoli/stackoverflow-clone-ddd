import { makeAnswer } from 'test/factories/make-answer'
import { OnAnswerCreated } from './on-asnwer-created'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeQuestion } from 'test/factories/make-question'
import { vi } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { OnAnswerCommentCreated } from './on-answer-comment-created'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { makeAnswerComment } from 'test/factories/make-answer-comment'

let answersRepository: InMemoryAnswersRepository
let answersAttachmentRepository: InMemoryAnswerAttachmentsRepository
let questionsRepository: InMemoryQuestionsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sendNotificationUseCase: SendNotificationUseCase
let notificationsRepository: InMemoryNotificationsRepository
let answerCommentsRepository: InMemoryAnswerCommentsRepository

let sendNotificationExecuteSpy: any

describe('On Answer Comment Created', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    )
    answersAttachmentRepository = new InMemoryAnswerAttachmentsRepository()
    answersRepository = new InMemoryAnswersRepository(
      answersAttachmentRepository,
    )
    notificationsRepository = new InMemoryNotificationsRepository()
    answerCommentsRepository = new InMemoryAnswerCommentsRepository()

    sendNotificationUseCase = new SendNotificationUseCase(
      notificationsRepository,
    )

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'exec')

    new OnAnswerCommentCreated(answersRepository, sendNotificationUseCase)
  })

  it('should send a notification when an answer comment is created', async () => {
    const question = makeQuestion()
    const answer = makeAnswer({
      questionId: question.id,
    })

    const answerComment = makeAnswerComment({
      answerId: answer.id,
    })

    questionsRepository.create(question)
    answersRepository.create(answer)
    answerCommentsRepository.create(answerComment)

    await waitFor(() => {
      expect(sendNotificationExecuteSpy).toHaveBeenCalled()
    })
  })
})
