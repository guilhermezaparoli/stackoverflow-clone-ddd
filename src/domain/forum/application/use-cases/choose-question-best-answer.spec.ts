import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { ChooseQuestionBestAnswerUseCase } from './choose-question-best-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { NotAllowedError } from './errors/not-allowed-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let questionsRepository: InMemoryQuestionsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let answersRepository: InMemoryAnswersRepository
let answerAttachmentRepository: InMemoryAnswerAttachmentsRepository
let sut: ChooseQuestionBestAnswerUseCase

describe('Choose question best answer', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    questionsRepository = new InMemoryQuestionsRepository(
      questionAttachmentsRepository,
    )
    answerAttachmentRepository = new InMemoryAnswerAttachmentsRepository()
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentRepository,
    )
    sut = new ChooseQuestionBestAnswerUseCase(
      answersRepository,
      questionsRepository,
    )
  })
  it('should be able to choose a best answer for a question', async () => {
    const createdQuestion = makeQuestion()

    const createdAnswer = makeAnswer({
      questionId: createdQuestion.id,
      authorId: new UniqueEntityID('author-1'),
    })

    await questionsRepository.create(createdQuestion)
    await answersRepository.create(createdAnswer)

    const result = await sut.exec({
      answerId: createdAnswer.id.toString(),
      authorId: createdQuestion.authorId.toString(),
    })

    expect(result.isRight()).toEqual(true)
    expect(questionsRepository.items[0]?.bestAnswerId).toEqual(createdAnswer.id)
  })

  it('should not be able to choose a best answer for a question from another author', async () => {
    const createdQuestion = makeQuestion({
      authorId: new UniqueEntityID('author-1'),
    })

    const createdAnswer = makeAnswer({
      questionId: createdQuestion.id,
    })

    await questionsRepository.create(createdQuestion)
    await answersRepository.create(createdAnswer)

    const result = await sut.exec({
      answerId: createdAnswer.id.toString(),
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
