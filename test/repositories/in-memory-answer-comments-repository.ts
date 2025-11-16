import type { AnswerCommentsRepository } from "@/domain/forum/application/repositories/answer-comments-repository";
import type { AnswerComment } from "@/domain/forum/enterprise/entities/answer-comment";

export class InMemoryAnswerCommentsRepository implements AnswerCommentsRepository {
    public items: AnswerComment[] = []
    
    async create(answer: AnswerComment): Promise<void> {
        this.items.push(answer)
    }


        async delete(answerComment: AnswerComment): Promise<void> {
            const itemIndex = this.items.findIndex((item) => item.id === answerComment.id)
    
            this.items.splice(itemIndex, 1)
        }
    
        async findById(id: string): Promise<AnswerComment | null> {
            const comment = this.items.find((item) => item.id.toString() === id)
    
            if (!comment) {
                return null
            }
    
            return comment
        }
    
    
}