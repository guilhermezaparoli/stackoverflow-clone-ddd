import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments'
import { makeAnswerComment } from 'test/factories/make-answer-comment'

let answerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: FetchAnswerCommentsUseCase

describe('Fetch Answer Answer Comments', () => {
  beforeEach(() => {
    answerCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new FetchAnswerCommentsUseCase(answerCommentsRepository)
  })
  it('should be able to fetch answer answer comments', async () => {
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-1'),
      }),
    )
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-1'),
      }),
    )
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-1'),
      }),
    )

    const { answerComments } = await sut.exec({
      page: 1,
      answerId: 'answer-1',
    })

    expect(answerComments.length).toEqual(3)
  })
  it('should not be able to fetch answer answer comments from another answer', async () => {
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-2'),
      }),
    )
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-2'),
      }),
    )
    await answerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-2'),
      }),
    )

    const { answerComments } = await sut.exec({
      page: 1,
      answerId: 'answer-1',
    })

    expect(answerComments.length).toEqual(0)
  })
  it('should be able to fetch paginated answer answer comments', async () => {
    for (let i = 1; i <= 22; i++) {
      await answerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityID('answer-2'),
        }),
      )
    }

    const { answerComments } = await sut.exec({
      page: 2,
      pageSize: 20,
      answerId: 'answer-2',
    })

    expect(answerComments.length).toEqual(2)
  })
})
