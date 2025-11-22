import { left, right, type Either } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import type { AnswersRepository } from '../repositories/answers-repository'
import { NotAllowedError } from './errors/not-allowed-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import type { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'

interface EditAnswerUseCaseRequest {
  authorId: string
  content: string
  answerId: string
  attachmentsIds: string[]
}

type EditAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    answer: Answer
  }
>

export class EditAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private asnwerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async exec({
    authorId,
    content,
    answerId,
    attachmentsIds,
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    if (answer.authorId.toString() !== authorId) {
      return left(new NotAllowedError())
    }

    const attachments = attachmentsIds.map((id) =>
      AnswerAttachment.create({
        answerId: answer.id,
        attachmentId: new UniqueEntityID(id),
      }),
    )

    const currentAttachments =
      await this.asnwerAttachmentsRepository.findManyByAnswerId(answerId)

    const attachmentsList = new AnswerAttachmentList(currentAttachments)

    attachmentsList.update(attachments)

    answer.attachments = attachmentsList
    answer.content = content

    await this.answersRepository.save(answer)

    return right({
      answer,
    })
  }
}
