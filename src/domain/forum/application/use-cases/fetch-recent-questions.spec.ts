import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions'

let questionsRepository: InMemoryQuestionsRepository
let sut: FetchRecentQuestionsUseCase

describe('Fetch recent questions', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new FetchRecentQuestionsUseCase(questionsRepository)
  })
  it('should be able to fetch recent questions', async () => {
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 20),
      }),
    )
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 18),
      }),
    )
    await questionsRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 23),
      }),
    )

    const result = await sut.exec({
      page: 1,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.questions.length).toEqual(3)
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(2022, 0, 23),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 20),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 18),
      }),
    ])
  })
  it('should be able to fetch paginated recent questions ', async () => {
    for (let i = 1; i <= 22; i++) {
      await questionsRepository.create(
        makeQuestion({
          createdAt: new Date(2022, 0, i),
        }),
      )
    }

    const result = await sut.exec({
      page: 2,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.questions).toHaveLength(2)
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(2022, 0, 2),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 1),
      }),
    ])
  })
})
