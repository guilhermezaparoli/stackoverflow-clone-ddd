import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'

import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { CommentOnQuestionUsecase } from './comment-on-question'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'

let questionsRepository: InMemoryQuestionsRepository
let questionCommentsRepository: InMemoryQuestionCommentsRepository
let questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: CommentOnQuestionUsecase

describe('Comment on Question', () => {
  beforeEach(() => {
    questionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    questionsRepository = new InMemoryQuestionsRepository(questionAttachmentsRepository)
    questionCommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new CommentOnQuestionUsecase(
      questionsRepository,
      questionCommentsRepository,
    )
  })
  it('should be able to comment on question', async () => {
    const question = makeQuestion()

    questionsRepository.create(question)

    const result = await sut.exec({
      authorId: question.authorId.toString(),
      questionId: question.id.toString(),
      content: 'Comentário',
    })

    expect(result.isRight()).toBe(true)
    expect(questionCommentsRepository.items[0]?.content).toEqual('Comentário')
  })
})
