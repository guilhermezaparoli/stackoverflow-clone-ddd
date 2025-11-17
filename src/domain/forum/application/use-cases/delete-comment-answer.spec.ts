import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { DeleteCommentAnswerUseCase } from './delete-comment-answer'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let answersCommentsRepository: InMemoryAnswerCommentsRepository
let sut: DeleteCommentAnswerUseCase

describe('Delete comment on answer', () => {
  beforeEach(() => {
    answersCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new DeleteCommentAnswerUseCase(answersCommentsRepository)
  })
  it('should be able to delete comment on answer', async () => {
    const comment = makeAnswerComment({
      authorId: new UniqueEntityID('author-1'),
    })

    answersCommentsRepository.create(comment)

    await sut.exec({
      authorId: 'author-1',
      commentId: comment.id.toString(),
    })
    expect(answersCommentsRepository.items).toHaveLength(0)
  })
  it('should not be able to delete a comment on a answer from another user', async () => {
    const comment = makeAnswerComment({
      authorId: new UniqueEntityID('author-1'),
    })

    answersCommentsRepository.create(comment)

    const result = await sut.exec({
      authorId: 'author-2',
      commentId: comment.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  it("should not be able to delete a comment that doesn't exists", async () => {
    const comment = makeAnswerComment({
      authorId: new UniqueEntityID('author-1'),
    })

    answersCommentsRepository.create(comment)

    const result = await sut.exec({
      authorId: 'author-2',
      commentId: '123',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
