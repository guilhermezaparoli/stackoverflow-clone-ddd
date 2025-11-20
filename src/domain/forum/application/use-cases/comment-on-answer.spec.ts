import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { CommentOnAnswerUsecase } from './comment-on-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'

let answersRepository: InMemoryAnswersRepository
let answerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: CommentOnAnswerUsecase

describe('Comment on Answer', () => {
  beforeEach(() => {
    answersRepository = new InMemoryAnswersRepository()
    answerCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new CommentOnAnswerUsecase(
      answersRepository,
      answerCommentsRepository,
    )
  })
  it('should be able to comment on answer', async () => {
    const answer = makeAnswer()

    answersRepository.create(answer)

 const result =   await sut.exec({
      authorId: answer.authorId.toString(),
      answerId: answer.id.toString(),
      content: 'Comentário',
    })

    expect(result.isRight()).toBe(true)
    expect(answerCommentsRepository.items[0]?.content).toEqual('Comentário')
  })
})
