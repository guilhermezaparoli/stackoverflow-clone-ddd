import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';

import { Slug } from '../../enterprise/entities/value-objects/slug';
import { DeleteQuestionUseCase } from './delete-question';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';




let questionsRepository: InMemoryQuestionsRepository;
let sut: DeleteQuestionUseCase;

describe("Delete question", () => {

    beforeEach(() => {
        questionsRepository = new InMemoryQuestionsRepository()
        sut = new DeleteQuestionUseCase(questionsRepository)
    })
    it('should be able to delete a question', async () => {
        const newQuestion = makeQuestion({
        
        }, new UniqueEntityID('question-1'))

        await questionsRepository.create(newQuestion)

        await sut.exec({
            questionId: 'question-1'
        })

        expect(questionsRepository.items).length(0)

    })
})
