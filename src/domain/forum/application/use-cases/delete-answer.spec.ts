import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { DeleteAnswerUseCase } from './delete-answer'
import { NotAllowedError } from './errors/not-allowed-error'
import { makeAnswerAttachment } from 'test/factories/maker-answer-attachment'

let answersRepository: InMemoryAnswersRepository
let asnwerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: DeleteAnswerUseCase

describe('Delete answer', () => {
  beforeEach(() => {
    asnwerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
    answersRepository = new InMemoryAnswersRepository()
    sut = new DeleteAnswerUseCase(answersRepository, asnwerAttachmentsRepository)
  })
  it('should be able to delete a answer', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('answer-1'),
    )

    asnwerAttachmentsRepository.items.push(
      makeAnswerAttachment(
        {
          answerId: newAnswer.id,
          attachmentId: new UniqueEntityID('1')
        },
      ),
      makeAnswerAttachment(
        {
          answerId: newAnswer.id,
          attachmentId: new UniqueEntityID('2')
        },
      )
    )

    await answersRepository.create(newAnswer)

    const result = await sut.exec({
      authorId: 'author-1',
      answerId: 'answer-1',
    })

    expect(result.isRight()).toBe(true)
    expect(answersRepository.items).length(0)
    expect(asnwerAttachmentsRepository.items).toHaveLength(0)
  })
  it('should not be able to delete a answer from another user', async () => {
    const newanswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('answer-1'),
    )

    await answersRepository.create(newanswer)

    const result = await sut.exec({
      authorId: 'author-2',
      answerId: 'answer-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
