import type { PaginationParams } from "@/core/repositories/pagination-params";
import type { QuestionAttachmentsRepository } from "@/domain/forum/application/repositories/question-attachments-repository";
import type { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";
import type { Question } from "@/domain/forum/enterprise/entities/question";

export class InMemoryQuestionsRepository implements QuestionsRepository {
    public items: Question[] = []

    constructor(private questionAttachmentsRepository: QuestionAttachmentsRepository) {}

    async create(question: Question): Promise<void> {
        this.items.push(question)
    }
    
    async save(question: Question): Promise<Question> {
        const itemIndex = this.items.findIndex((item) => item.id === question.id)

        this.items[itemIndex] = question

        return question
    }
    
    async delete(question: Question): Promise<void> {
        const itemIndex = this.items.findIndex((item) => item.id === question.id)
        this.items.splice(itemIndex, 1)

        this.questionAttachmentsRepository.deleteManyByQuestionId(question.id.toString()) 
        
    }
    
    async findBySlug(slug: string): Promise<Question | null> {
        const question = this.items.find(item => item.slug.value === slug)

        if(!question) {
            return null
        }

        return question
    }

    async findById(id: string): Promise<Question | null> {
        const question = this.items.find((item) => item.id.toString() === id)

        if(!question) {
            return null
        }

        return question
    }

    async findManyRecent({ page = 1, pageSize = 20 }: PaginationParams): Promise<Question[]> {
        const questions = this.items.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice((page - 1) * pageSize, page * pageSize)

        return questions
    }

}