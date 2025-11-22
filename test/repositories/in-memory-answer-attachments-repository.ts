import type { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";
import type { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";

export class InMemoryAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
    items: AnswerAttachment[] = []

    async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
        const answerAttachments = this.items.filter((item) => item.answerId.toString() === answerId)

        return answerAttachments
    }

    async deleteManyByAnswerId(answerId: string): Promise<void> {
        const asnwerAttachments = this.items.filter((item) => item.answerId.toString() !== answerId)
        
        this.items = asnwerAttachments
    }
    
}