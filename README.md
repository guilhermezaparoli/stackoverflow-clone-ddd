# DDD Forum - Domain-Driven Design Implementation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Test](https://img.shields.io/badge/Tests-Vitest-yellow.svg)](https://vitest.dev/)

A practical implementation of Domain-Driven Design (DDD) principles in TypeScript, demonstrating clean architecture patterns through a forum application domain.

## Overview

This project serves as a learning resource and reference implementation for DDD concepts, including:

- **Entities** with unique identity
- **Value Objects** for domain concepts
- **Use Cases** for business logic orchestration
- **Repository Pattern** for data persistence abstraction
- **Clean Architecture** with clear separation of concerns

## Project Structure

```
src/
├── core/                          # Reusable, domain-agnostic code
│   ├── entities/                  # Base entity classes
│   │   ├── entity.ts              # Generic entity base class
│   │   └── unique-entity-id.ts    # Value object for entity IDs
│   ├── repositories/              # Repository abstractions
│   │   └── pagination-params.ts   # Pagination interfaces
│   └── types/                     # Utility types
│       └── optional.ts            # TypeScript utility types
│
└── domain/                        # Business domain logic
    └── forum/                     # Forum bounded context
        ├── application/           # Application layer
        │   ├── repositories/      # Repository interfaces
        │   │   ├── answers-repository.ts
        │   │   └── questions-repository.ts
        │   └── use-cases/         # Business use cases
        │       ├── answer-question.ts
        │       ├── choose-question-best-answer.ts
        │       ├── create-question.ts
        │       ├── delete-answer.ts
        │       ├── delete-question.ts
        │       ├── edit-answer.ts
        │       ├── edit-question.ts
        │       ├── fetch-recent-questions.ts
        │       └── get-question-by-slug.ts
        │
        └── enterprise/            # Enterprise/Domain layer
            └── entities/          # Domain entities
                ├── answer.ts
                ├── instructor.ts
                ├── question.ts
                ├── student.ts
                └── value-objects/
                    └── slug.ts    # URL-friendly slug value object
```

## Key Concepts

### Entities

Entities are objects with unique identity that persist over time. Even if attributes change, the entity remains the same.

**Example:**
```typescript
const question = Question.create({
  authorId: new UniqueEntityID('author-1'),
  title: 'How to implement DDD?',
  content: 'I need help understanding DDD principles...'
})
```

### Value Objects

Objects defined by their values rather than identity. Two value objects with the same values are considered equal.

**Example:**
```typescript
const slug = Slug.createFromText('How to implement DDD?')
// Result: "how-to-implement-ddd"
```

### Use Cases

Encapsulate business logic for specific operations. They orchestrate entities and repositories to accomplish a task.

**Example:**
```typescript
const createQuestion = new CreateQuestionUseCase(questionsRepository)
const { question } = await createQuestion.exec({
  authorId: 'user-123',
  title: 'My Question',
  content: 'Question content...'
})
```

### Repository Pattern

Abstracts data persistence, providing a collection-like interface for entities.

**Example:**
```typescript
interface QuestionsRepository {
  create(question: Question): Promise<void>
  findBySlug(slug: string): Promise<Question | null>
  findById(id: string): Promise<Question | null>
  delete(question: Question): Promise<void>
  save(question: Question): Promise<void>
}
```

## Features

### Questions Management
- Create questions with automatic slug generation
- Edit question title and content
- Delete questions
- Fetch recent questions with pagination
- Get question by slug
- Choose best answer for questions

### Answers Management
- Answer questions
- Edit answers
- Delete answers
- Select best answer

## Installation

```bash
# Install dependencies
npm install
```

## Available Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Lint the code
npm run lint

# Lint and fix issues
npm run lint:fix
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. All use cases have corresponding test files.

**Example test:**
```typescript
test('should be able to create a question', async () => {
  const questionsRepository = new InMemoryQuestionsRepository()
  const createQuestion = new CreateQuestionUseCase(questionsRepository)

  const { question } = await createQuestion.exec({
    authorId: 'author-1',
    title: 'New Question',
    content: 'Question content'
  })

  expect(question.id).toBeTruthy()
  expect(questionsRepository.items[0].id).toEqual(question.id)
})
```

## Technologies

- **TypeScript** - Static typing for JavaScript
- **Vitest** - Fast unit testing framework
- **Day.js** - Lightweight date manipulation library
- **ESLint** - Code linting with Rocketseat config
- **@faker-js/faker** - Generate fake data for tests

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
Each class has one reason to change. Entities manage domain logic, use cases orchestrate operations, repositories handle persistence.

### Open/Closed Principle (OCP)
The `Entity<T>` base class is open for extension but closed for modification.

### Liskov Substitution Principle (LSP)
Any repository implementation can substitute another without breaking the application.

### Interface Segregation Principle (ISP)
Small, focused interfaces (e.g., `AnswersRepository`, `QuestionsRepository`).

### Dependency Inversion Principle (DIP)
Use cases depend on abstractions (repository interfaces), not concrete implementations.

## Architecture Layers

### 1. Core Layer
Generic, reusable building blocks that can be used across any domain:
- Base `Entity` class
- `UniqueEntityID` value object
- Type utilities like `Optional<T, K>`

### 2. Domain Layer (Enterprise)
Domain entities with business rules:
- `Question`, `Answer`, `Student`, `Instructor`
- Value objects like `Slug`

### 3. Application Layer
Application-specific business logic:
- Use cases (application operations)
- Repository interfaces (persistence contracts)

## Learning Resources

This project includes a comprehensive study guide in Portuguese: [GUIA-DE-ESTUDO.md](./GUIA-DE-ESTUDO.md)

The guide covers:
- DDD fundamentals
- Entity vs Value Object
- Repository pattern
- Use cases
- SOLID principles
- Testing strategies
- Practical exercises

## Development Guidelines

### Creating a New Entity

```typescript
export interface MyEntityProps {
  name: string
  createdAt: Date
  updatedAt?: Date
}

export class MyEntity extends Entity<MyEntityProps> {
  get name() {
    return this.props.name
  }

  static create(
    props: Optional<MyEntityProps, 'createdAt'>,
    id?: UniqueEntityID
  ) {
    const entity = new MyEntity({
      ...props,
      createdAt: props.createdAt ?? new Date()
    }, id)

    return entity
  }
}
```

### Creating a New Use Case

```typescript
interface MyUseCaseRequest {
  // Input parameters
}

interface MyUseCaseResponse {
  // Output data
}

export class MyUseCase {
  constructor(
    private myRepository: MyRepository
  ) {}

  async exec(request: MyUseCaseRequest): Promise<MyUseCaseResponse> {
    // Business logic here
    return { /* response */ }
  }
}
```

### Writing Tests

```typescript
import { describe, test, expect } from 'vitest'

describe('MyUseCase', () => {
  test('should perform expected operation', async () => {
    // Arrange
    const repository = new InMemoryRepository()
    const useCase = new MyUseCase(repository)

    // Act
    const result = await useCase.exec({ /* params */ })

    // Assert
    expect(result).toBeTruthy()
  })
})
```

## Future Enhancements

- [ ] Implement real database repositories (Prisma)
- [ ] Add domain events
- [ ] Implement aggregates
- [ ] Add specifications pattern
- [ ] Create API layer (controllers/routes)
- [ ] Add authentication and authorization
- [ ] Implement comments on questions/answers
- [ ] Add voting system
- [ ] User profiles and reputation
- [ ] Search functionality

## Contributing

This is a learning project, but contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Domain-Driven Design concepts by Eric Evans
- Clean Architecture principles by Robert C. Martin
- TypeScript community for excellent tooling

---

**Made with focus on clean code and software architecture principles**
