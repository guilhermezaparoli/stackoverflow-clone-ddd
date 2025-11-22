import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";

export function makeAnswerAttachment(override: Partial<AnswerAttachment> = {}, id?: UniqueEntityID) {
    return AnswerAttachment.create({
        answerId: new UniqueEntityID(),
        attachmentId: new UniqueEntityID(),
        ...override
    }, id)
}