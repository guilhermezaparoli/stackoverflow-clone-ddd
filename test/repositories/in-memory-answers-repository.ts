import type { Answer } from "@/domain/forum/enterprise/entities/answer";
import type { AnswersRepository } from "@/domain/forum/application/repositories/answers-repository";

export class InMemoryAnswersRepository implements AnswersRepository {
    public items: Answer[] = []

    async create(answer: Answer): Promise<void> {
        this.items.push(answer)
    }

    async findById(id: string){
        const question = this.items.find((item) => item.id.toString() === id)

        if(!question) {
            return null
        }

        return question
    }

    async delete(answer: Answer): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id === answer.id)

        this.items.splice(itemIndex, 1)
    }
}
