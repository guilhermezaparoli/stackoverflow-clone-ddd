import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { CreateQuestionUseCase } from './create-question'

let questionsRepository: InMemoryQuestionsRepository
let sut: CreateQuestionUseCase

describe('Create Question', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new CreateQuestionUseCase(questionsRepository)
  })
  it('should be able to create a question', async () => {
    const result = await sut.exec({
      authorId: '1',
      content: '1',
      title: '1',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.question.id).toBeTruthy()
    expect(questionsRepository.items).length(1)
    expect(questionsRepository.items[0]?.id).toEqual(result.value?.question.id)
  })
})
