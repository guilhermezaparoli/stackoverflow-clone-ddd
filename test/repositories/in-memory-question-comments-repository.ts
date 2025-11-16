import type { PaginationParams } from "@/core/repositories/pagination-params";
import type { QuestionCommentsRepository } from "@/domain/forum/application/repositories/question-comments-repository";
import type { QuestionComment } from "@/domain/forum/enterprise/entities/question-comment";

export class InMemoryQuestionCommentsRepository implements QuestionCommentsRepository {
    public items: QuestionComment[] = []

    async create(question: QuestionComment): Promise<void> {
        this.items.push(question)
    }

    async delete(questionComment: QuestionComment): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id === questionComment.id)

        this.items.splice(itemIndex, 1)
    }

    async findById(id: string): Promise<QuestionComment | null> {
        const comment = this.items.find((item) => item.id.toString() === id)

        if (!comment) {
            return null
        }

        return comment
    }

      async findManyByQuestionId(id: string, { page = 1, pageSize = 20}: PaginationParams): Promise<QuestionComment[]> {
            const quesitoncomments = this.items.filter((item) => item.questionId.toString() === id).slice((page - 1) * pageSize, page * pageSize)
    
            return quesitoncomments
        } 

}