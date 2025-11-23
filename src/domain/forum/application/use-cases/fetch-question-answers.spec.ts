import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers'
import { makeAnswer } from 'test/factories/make-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let answersRepository: InMemoryAnswersRepository
let answerAttachmentRepository: InMemoryAnswerAttachmentsRepository
let sut: FetchQuestionAnswersUseCase

describe('Fetch Question Answers', () => {
  beforeEach(() => {
    answerAttachmentRepository = new InMemoryAnswerAttachmentsRepository()
    answersRepository = new InMemoryAnswersRepository(
      answerAttachmentRepository,
    )
    sut = new FetchQuestionAnswersUseCase(answersRepository)
  })
  it('should be able to fetch question answers', async () => {
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-1'),
      }),
    )

    const result = await sut.exec({
      page: 1,
      questionId: 'question-1',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.answers.length).toEqual(3)
  })
  it('should not be able to fetch question answers from another question', async () => {
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-2'),
      }),
    )
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-2'),
      }),
    )
    await answersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-2'),
      }),
    )

    const result = await sut.exec({
      page: 1,
      questionId: 'question-1',
    })

    expect(result.value?.answers.length).toEqual(0)
  })
  it('should be able to fetch paginated question answers', async () => {
    for (let i = 1; i <= 22; i++) {
      await answersRepository.create(
        makeAnswer({
          questionId: new UniqueEntityID('question-2'),
        }),
      )
    }

    const result = await sut.exec({
      page: 2,
      pageSize: 20,
      questionId: 'question-2',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.answers.length).toEqual(2)
  })
})
