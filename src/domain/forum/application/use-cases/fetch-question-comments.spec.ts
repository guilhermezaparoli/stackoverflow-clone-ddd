import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { FetchQuestionCommentsUseCase } from './fetch-question-comments'
import { makeQuestionComment } from 'test/factories/make-question-comment'

let questioncommentsRepository: InMemoryQuestionCommentsRepository
let sut: FetchQuestionCommentsUseCase

describe('Fetch Question Question Comments', () => {
  beforeEach(() => {
    questioncommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new FetchQuestionCommentsUseCase(questioncommentsRepository)
  })
  it('should be able to fetch question question comments', async () => {
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-1'),
      }),
    )

    const { questioncomments } = await sut.exec({
      page: 1,
      questionId: 'question-1',
    })

    expect(questioncomments.length).toEqual(3)
  })
  it('should not be able to fetch question question comments from another question', async () => {
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-2'),
      }),
    )
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-2'),
      }),
    )
    await questioncommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-2'),
      }),
    )

    const { questioncomments } = await sut.exec({
      page: 1,
      questionId: 'question-1',
    })

    expect(questioncomments.length).toEqual(0)
  })
  it('should be able to fetch paginated question question comments', async () => {
    for (let i = 1; i <= 22; i++) {
      await questioncommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityID('question-2'),
        }),
      )
    }

    const { questioncomments } = await sut.exec({
      page: 2,
      pageSize: 20,
      questionId: 'question-2',
    })

    expect(questioncomments.length).toEqual(2)
  })
})
