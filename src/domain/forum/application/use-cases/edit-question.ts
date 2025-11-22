import { Question } from '@/domain/forum/enterprise/entities/question'
import type { QuestionsRepository } from '../repositories/questions-repository'
import { left, right, type Either } from '@/core/either'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from './errors/not-allowed-error'
import type { QuestionAttachmentsRepository } from '../repositories/question-attachments-repository'
import { QuestionAttachmentList } from '../../enterprise/entities/question-attachment-list'
import { QuestionAttachment } from '../../enterprise/entities/question-attachment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface EditQuestionUseCaseRequest {
  authorId: string
  content: string
  title: string
  questionId: string
  attachmentsIds: string[]
}

type EditQuestionUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    question: Question
  }
>

export class EditQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionAttachments: QuestionAttachmentsRepository,
  ) {}

  async exec({
    authorId,
    content,
    title,
    questionId,
    attachmentsIds,
  }: EditQuestionUseCaseRequest): Promise<EditQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    if (question.authorId.toString() !== authorId) {
      return left(new NotAllowedError())
    }

    const currentQuestionAttachments =
      await this.questionAttachments.findManyByQuestionId(questionId)

    const questionAttachmentList = new QuestionAttachmentList(
      currentQuestionAttachments,
    )

    const attachments = attachmentsIds.map((id) =>
      QuestionAttachment.create({
        attachmentId: new UniqueEntityID(id),
        questionId: new UniqueEntityID(questionId),
      }),
    )

    questionAttachmentList.update(attachments)

    question.title = title
    question.content = content
    question.attachments = questionAttachmentList

    await this.questionsRepository.save(question)

    return right({
      question,
    })
  }
}
