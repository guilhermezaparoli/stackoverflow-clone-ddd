import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { EditAnswerUseCase } from './edit-answer'
import { NotAllowedError } from './errors/not-allowed-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { makeAnswerAttachment } from 'test/factories/maker-answer-attachment'

let answersRepository: InMemoryAnswersRepository
let answerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: EditAnswerUseCase

describe('Edit Answer', () => {
  beforeEach(() => {
    answerAttachmentsRepository = new InMemoryAnswerAttachmentsRepository()
    answersRepository = new InMemoryAnswersRepository()
    sut = new EditAnswerUseCase(answersRepository, answerAttachmentsRepository)
  })
  it('should be able to edit a answer', async () => {
    const createdAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('answer-1'),
    )

    answersRepository.create(createdAnswer)

    answerAttachmentsRepository.items.push(
      makeAnswerAttachment({
        answerId: createdAnswer.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeAnswerAttachment({
        answerId: createdAnswer.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await sut.exec({
      authorId: createdAnswer.authorId.toString(),
      content: 'New content',
      answerId: createdAnswer.id.toString(),
      attachmentsIds: ['1', '3'],
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      answer: expect.objectContaining({
        content: 'New content',
      }),
    })
    expect(answersRepository.items[0]?.attachments.currentItems).toHaveLength(2)
    expect(answersRepository.items[0]?.attachments.currentItems).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('3'),
      }),
    ])
  })
  it('should not be able to edit a answer from another author', async () => {
    const createdAnswer = makeAnswer({
      authorId: new UniqueEntityID('author-1'),
      content: 'content',
    })

    answersRepository.create(createdAnswer)

    const result = await sut.exec({
      authorId: 'author-2',
      content: 'New content',
      answerId: createdAnswer.id.toString(),
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
