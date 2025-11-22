import type { QuestionAttachmentsRepository } from "@/domain/forum/application/repositories/question-attachments-repository";
import type { QuestionAttachment } from "@/domain/forum/enterprise/entities/question-attachment";


export class InMemoryQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
    public items: QuestionAttachment[] = []


    async findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]> {
        const quesitoncomments = this.items.filter((item) => item.questionId.toString() === questionId)

        return quesitoncomments
    }

    async deleteManyByQuestionId(questionId: string): Promise<void> {
        const attachments = this.items.filter(item => item.questionId.toString() !== questionId)

        this.items = attachments
    }

}