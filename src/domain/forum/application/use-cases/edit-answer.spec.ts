import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { EditAnswerUseCase } from './edit-answer'

let answersRepository: InMemoryAnswersRepository
let sut: EditAnswerUseCase

describe('Edit Answer', () => {
  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    sut = new EditAnswerUseCase(answersRepository)
  })
  it('should be able to edit a answer', async () => {
    const createdAnswer = makeAnswer({
      authorId: new UniqueEntityID('author-1'),
    })

    answersRepository.create(createdAnswer)

    const { answer } = await sut.exec({
      authorId: createdAnswer.authorId.toString(),
      content: 'New content',
      answerId: createdAnswer.id.toString(),
    })

    expect(answer.content).toEqual('New content')
  })
  it('should not be able to edit a answer from another author', async () => {
    const createdAnswer = makeAnswer({
      authorId: new UniqueEntityID('author-1'),
      content: 'content',
    })

    answersRepository.create(createdAnswer)

    await expect(() =>
      sut.exec({
        authorId: 'author-2',
        content: 'New content',
        answerId: createdAnswer.id.toString(),
      }),
    ).rejects.instanceOf(Error)
  })
})
