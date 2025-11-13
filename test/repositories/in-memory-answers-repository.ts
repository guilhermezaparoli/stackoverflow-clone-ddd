import type { Answer } from "@/domain/forum/enterprise/entities/answer";
import type { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";
import type { PaginationParams } from "@/core/repositories/pagination-params";

export class InMemoryAnswersRepository implements AnswersRepository {
    public items: Answer[] = []

    async create(answer: Answer): Promise<void> {
        this.items.push(answer)
    }

    async save(answer: Answer): Promise<Answer> {
        const itemIndex = this.items.findIndex((item) => item.id === answer.id)
        
        this.items[itemIndex] = answer

        return answer
    }
    

    async findById(id: string){
        const question = this.items.find((item) => item.id.toString() === id)

        if(!question) {
            return null
        }

        return question
    }

    async findManyByQuestionId(id: string, { page = 1, pageSize = 20}: PaginationParams): Promise<Answer[]> {
        const answers = this.items.filter((item) => item.questionId.toString() === id).slice((page - 1) * pageSize, page * pageSize)

        return answers
    }

    async delete(answer: Answer): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id === answer.id)

        this.items.splice(itemIndex, 1)
    }
}
