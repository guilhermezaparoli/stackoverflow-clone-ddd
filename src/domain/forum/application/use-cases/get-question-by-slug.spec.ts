import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';
import { Slug } from '../../enterprise/entities/value-objects/slug';



let questionsRepository: InMemoryQuestionsRepository;
let sut: GetQuestionBySlugUseCase;

describe("Get question by slug", () => {

    beforeEach(() => {
        questionsRepository = new InMemoryQuestionsRepository()
        sut = new GetQuestionBySlugUseCase(questionsRepository)
    })
    it('should be able to get a question by slug', async () => {
        const newQuestion = makeQuestion({
            slug: Slug.create('example-question')
        })

        await questionsRepository.create(newQuestion)

        const { question } = await sut.exec({
            slug: "example-question"
        })

        expect(question.id).toBeTruthy()
        expect(questionsRepository.items).length(1)
        expect(questionsRepository.items[0]?.id).toEqual(question.id)
        expect(question.title).toEqual(newQuestion.title)

    })
})
