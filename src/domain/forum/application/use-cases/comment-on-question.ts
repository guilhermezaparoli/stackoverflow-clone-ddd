import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { QuestionComment } from "../../enterprise/entities/question-comment";
import type { QuestionsRepository } from "../repositories/questions-repository";
import type { QuestionCommentsRepository } from "../repositories/question-comments-repository";

interface CommentOnQuestionUsecaseRequest {
    content: string;
    authorId: string;
    questionId: string;
}
interface CommentOnQuestionUsecaseResponse {
    questionComment: QuestionComment
 }


export class CommentOnQuestionUsecase {

    constructor(private questionsRepository: QuestionsRepository,
        private questionCommentsRepository: QuestionCommentsRepository
    ) { }

    async exec({ authorId, content, questionId }: CommentOnQuestionUsecaseRequest): Promise<CommentOnQuestionUsecaseResponse> { 

        const question = this.questionsRepository.findById(questionId)

        if(!question) {
            throw new Error("Question not found.")
        }

        const questionComment = QuestionComment.create({
            authorId: new UniqueEntityID(authorId),
            questionId: new UniqueEntityID(questionId),
            content
        })

        await this.questionCommentsRepository.create(questionComment)

        return {
            questionComment
        }

    }

}