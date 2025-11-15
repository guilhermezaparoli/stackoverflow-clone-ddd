import type { QuestionCommentsRepository } from "../repositories/question-comments-repository"


interface DeleteCommentOnQuestionUseCaseRequest {
    authorId: string
    commentId: string
}


export class DeleteCommentOnQuestionUseCase {
    constructor(
        private commentOnQuestionsRepository: QuestionCommentsRepository) { }

    async exec({
        authorId,
        commentId
    }: DeleteCommentOnQuestionUseCaseRequest): Promise<void> {
        const comment = await this.commentOnQuestionsRepository.findById(commentId)

        if (!comment) {
            throw new Error("Comment not found.")
        }

        if(authorId !== comment.authorId.toString()) {
            throw new Error("Not allowed.")
        }

        await this.commentOnQuestionsRepository.delete(comment)

        return 
    }
}
