import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { EditQuestionUseCase } from './edit-question'
import { NotAllowedError } from './errors/not-allowed-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'
import { makeQuestionAttachment } from 'test/factories/make-question-attachment'

let questionsRepository: InMemoryQuestionsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: EditQuestionUseCase

describe('Edit Question', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository)
    sut = new EditQuestionUseCase(
      questionsRepository,
      questionAttachmentsRepository,
    )
  })
  it('should be able to edit a question', async () => {
    const createdQuestion = makeQuestion(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('question-1'),
    )

    questionsRepository.create(createdQuestion)

    questionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: createdQuestion.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeQuestionAttachment({
        questionId: createdQuestion.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await sut.exec({
      authorId: createdQuestion.authorId.toString(),
      content: 'New content',
      title: 'New title',
      questionId: createdQuestion.id.toString(),
      attachmentsIds: ['1', '3'],
    })

    expect(result.isRight()).toBe(true)
    console.log(result.value)
    expect(result.value).toEqual({
      question: expect.objectContaining({
        content: 'New content',
        title: 'New title',
      }),
    })

    expect(questionsRepository.items[0]?.attachments.currentItems).toHaveLength(
      2,
    )
    expect(questionsRepository.items[0]?.attachments.currentItems).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityID('1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityID('3'),
      }),
    ])
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
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  it('should able to edit a question from another author', async () => {
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
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
