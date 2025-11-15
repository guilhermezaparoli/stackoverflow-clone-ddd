import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { DeleteCommentOnQuestionUseCase } from './delete-comment-on-question'

let questionsCommentsRepository: InMemoryQuestionCommentsRepository
let sut: DeleteCommentOnQuestionUseCase

describe('Delete comment on question', () => {
  beforeEach(() => {
    questionsCommentsRepository = new InMemoryQuestionCommentsRepository()
    sut = new DeleteCommentOnQuestionUseCase(questionsCommentsRepository)
  })
  it('should be able to delete comment on question', async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    await sut.exec({
      authorId: 'author-1',
      commentId: comment.id.toString(),
    })
    expect(questionsCommentsRepository.items).toHaveLength(0)
  })
  it('should not be able to delete a comment on a question from another user', async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    await expect(() =>
      sut.exec({
        authorId: 'author-2',
        commentId: comment.id.toString(),
      }),
    ).rejects.instanceOf(Error)
  })
  it("should not be able to delete a comment that doesn't exists", async () => {
    const comment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    questionsCommentsRepository.create(comment)

    await expect(() =>
      sut.exec({
        authorId: 'author-2',
        commentId: '123',
      }),
    ).rejects.instanceOf(Error)
  })
})
