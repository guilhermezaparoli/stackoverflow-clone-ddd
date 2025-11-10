import  { InMemoryAnswersRepository } from "test/repositories/in-memory-answers-repository";
import  { DeleteAnswerUseCase } from "./delete-answer";
import { makeAnswer } from "test/factories/make-answer";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";




let answersRepository: InMemoryAnswersRepository;
let sut: DeleteAnswerUseCase;

describe("Delete answer", () => {

    beforeEach(() => {
        answersRepository = new InMemoryAnswersRepository()
        sut = new DeleteAnswerUseCase(answersRepository)
    })
    it('should be able to delete a answer', async () => {
        const newAnswer = makeAnswer({
            authorId: new UniqueEntityID('author-1')
        }, new UniqueEntityID('answer-1'))
 
        await answersRepository.create(newAnswer)

        await sut.exec({
            authorId: 'author-1',
            answerId: 'answer-1'
        })

        console.log(answersRepository.items, "aquuiii");
        expect(answersRepository.items).length(0)

    })
    it('should not be able to delete a answer from another user', async () => {
        const newanswer = makeAnswer({
            authorId: new UniqueEntityID('author-1')
        }, new UniqueEntityID('answer-1'))

        await answersRepository.create(newanswer)

      

        expect(() => sut.exec({
            authorId: 'author-2',
            answerId: 'answer-1'
        })).rejects.toBeInstanceOf(Error)

    })
})
