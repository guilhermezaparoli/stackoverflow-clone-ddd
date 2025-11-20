import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { DeleteCommentQuestionUseCase } from './delete-comment-question'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from './errors/not-allowed-error'

let questionsCommentsRepository: InMemoryQuestionCommentsRepository
let sut: DeleteCommentQuestionUseCase

describe('Delete comment on question', () => {
  beforeEach(() => {
    questionsCommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new DeleteCommentQuestionUseCase(questionsCommentsRepository)
  })
  it('should be able to delete comment on question', async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    const result = await sut.exec({
      authorId: 'author-1',
      commentId: comment.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(questionsCommentsRepository.items).toHaveLength(0)
  })
  it('should not be able to delete a comment on a question from another user', async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    const result = await sut.exec({
      authorId: 'author-2',
      commentId: comment.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  it("should not be able to delete a comment that doesn't exists", async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    const result = await sut.exec({
      authorId: 'author-2',
      commentId: '123',
    })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
