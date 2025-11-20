import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { EditQuestionUseCase } from './edit-question'
import { NotAllowedError } from './errors/not-allowed-error'

let questionsRepository: InMemoryQuestionsRepository
let sut: EditQuestionUseCase

describe('Edit Question', () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository()
    sut = new EditQuestionUseCase(questionsRepository)
  })
  it('should be able to edit a question', async () => {
    const createdQuestion = makeQuestion({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsRepository.create(createdQuestion)

    const result = await sut.exec({
      authorId: createdQuestion.authorId.toString(),
      content: 'New content',
      title: 'New title',
      questionId: createdQuestion.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      question: expect.objectContaining({
        content: 'New content',
        title: 'New title',
      }),
    })
  })
  it('should not be able to edit a question from another author', async () => {
    const createdQuestion = makeQuestion({
      authorId: new UniqueEntityID('author-1'),
      title: 'title',
      content: 'content',
    })

    questionsRepository.create(createdQuestion)

    const result = await sut.exec({
      authorId: 'author-2',
      content: 'New content',
      title: 'New title',
      questionId: createdQuestion.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
