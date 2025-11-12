# 📚 Guia de Estudo - Domain-Driven Design (DDD)

Este guia contém perguntas e respostas sobre os conceitos implementados no projeto até agora. Use-o para identificar lacunas no seu conhecimento e consolidar o aprendizado.

---

## 🏗️ ARQUITETURA E ESTRUTURA DO PROJETO

### 1. O que é DDD (Domain-Driven Design)?
**Resposta:** DDD é uma abordagem de desenvolvimento de software que coloca o domínio (regras de negócio) no centro da aplicação. O foco está em modelar o software de acordo com a complexidade do negócio, usando uma linguagem ubíqua (comum entre desenvolvedores e especialistas do domínio).

### 2. Por que a estrutura do projeto está dividida em `core` e `domain`?
**Resposta:** 
- **`core/`**: Contém elementos genéricos e reutilizáveis que podem ser usados em qualquer domínio (Entity, UniqueEntityID, tipos utilitários)
- **`domain/`**: Contém as regras de negócio específicas da aplicação (entidades do negócio, casos de uso, repositórios)

Esta separação segue o princípio de **Separation of Concerns** e permite reutilizar o código do `core` em outros projetos.

### 3. Qual é a diferença entre as pastas `entities`, `use-cases` e `repositories`?
**Resposta:**
- **`entities/`**: Representam os conceitos do domínio (Question, Answer, Student, Instructor). Contêm dados e comportamentos relacionados ao negócio.
- **`use-cases/`**: Implementam as ações/operações que o sistema pode realizar (ex: responder uma pergunta). Orquestram as entidades e repositórios.
- **`repositories/`**: Definem contratos (interfaces) para persistência de dados. Abstraem como os dados são salvos/recuperados.

---

## 🧱 ENTIDADES (ENTITIES)

### 4. O que é uma Entidade no contexto de DDD?
**Resposta:** Uma entidade é um objeto que possui identidade única e continuidade ao longo do tempo. Mesmo que seus atributos mudem, ela continua sendo a mesma entidade. Exemplo: uma `Question` com ID "123" é sempre a mesma pergunta, mesmo que seu conteúdo seja editado.

### 5. Por que a classe `Entity` é genérica (`Entity<T>`)?
**Resposta:** O uso de generics (`<T>`) permite que a classe base `Entity` seja reutilizada por qualquer entidade do domínio, mantendo type-safety. Cada entidade específica (Question, Answer) passa suas próprias props como tipo genérico.

```typescript
export class Entity<T> {
    protected props: T  // T será QuestionProps, AnswerProps, etc.
}
```

### 6. Por que o construtor da classe `Entity` é `protected`?
**Resposta:** Para forçar o uso de factory methods (como `Question.create()`) ao invés de `new Question()`. Isso:
- Centraliza a lógica de criação
- Permite validações antes de criar a entidade
- Torna o código mais expressivo e seguro

### 7. O que é o `UniqueEntityID` e por que não usar strings diretamente?
**Resposta:** É um Value Object que encapsula o ID da entidade. Benefícios:
- **Type Safety**: Evita passar strings comuns onde deveria ser um ID
- **Encapsulamento**: Centraliza a lógica de geração de IDs (UUID)
- **Semântica**: Deixa claro que aquele valor é um identificador único

### 8. O que são os métodos `get` nas entidades (getters)?
**Resposta:** São acessores que expõem propriedades privadas de forma controlada. Permitem:
- Encapsular o estado interno (`props`)
- Adicionar lógica ao acessar valores (como no `excerpt`)
- Manter imutabilidade (não expor `props` diretamente)

```typescript
get content() {
    return this.props.content  // Acesso controlado
}
```

### 9. O que é o método `touch()` e por que ele é `private`?
**Resposta:** O `touch()` atualiza o `updatedAt` para a data atual. É privado porque:
- É um detalhe de implementação interno
- Só deve ser chamado pelos setters da própria classe
- Evita que código externo manipule diretamente o `updatedAt`

### 10. Por que alguns setters chamam `touch()` e outros não?
**Resposta:** Apenas setters que modificam o conteúdo da entidade chamam `touch()` para registrar a última modificação. Isso é útil para auditoria e controle de versão.

---

## 🎯 VALUE OBJECTS

### 11. O que é um Value Object?
**Resposta:** É um objeto definido apenas por seus valores, sem identidade própria. Dois Value Objects com os mesmos valores são considerados iguais. Exemplo: `Slug` - não importa qual instância, se o valor é "minha-pergunta", são equivalentes.

### 12. Por que `Slug` é um Value Object e não uma string simples?
**Resposta:** Encapsular o slug em uma classe:
- Centraliza a lógica de criação/normalização
- Adiciona validações se necessário
- Torna o código mais expressivo: `slug: Slug` vs `slug: string`
- Facilita mudanças futuras na lógica de slug

### 13. O que faz o método `Slug.createFromText()`?
**Resposta:** Transforma um texto comum em um slug válido para URLs:
1. `.normalize("NFKD")` - Remove acentos
2. `.trim()` - Remove espaços nas pontas
3. `.toLocaleLowerCase()` - Converte para minúsculas
4. `.replace(/\s+/g, '-')` - Substitui espaços por hífens
5. `.replace(/[^\w-]+/g, '')` - Remove caracteres especiais
6. `.replace(/_/g, '-')` - Substitui underscores por hífens
7. `.replace(/--+/g, '-')` - Remove hífens duplicados
8. `.replace(/-$/g, '')` - Remove hífen no final

Exemplo: "Minha Pergunta!" → "minha-pergunta"

---

## 🔧 TIPOS UTILITÁRIOS

### 14. O que faz o tipo `Optional<T, K>`?
**Resposta:** Torna algumas propriedades de um tipo opcionais. É usado nos factory methods para não exigir campos que são gerados automaticamente.

```typescript
// Sem Optional, precisaria passar createdAt:
Answer.create({ content, authorId, questionId, createdAt: new Date() })

// Com Optional<AnswerProps, "createdAt">:
Answer.create({ content, authorId, questionId })  // createdAt é opcional
```

**Como funciona:**
- `Pick<Partial<T>, K>`: Pega as propriedades K e as torna opcionais
- `Omit<T, K>`: Pega todas as outras propriedades (obrigatórias)
- `&`: Une os dois tipos

### 15. Por que usar `Optional` ao invés de marcar campos como opcionais na interface?
**Resposta:** Porque na interface original, `createdAt` NÃO é opcional - toda entidade deve ter essa propriedade. O `Optional` é usado apenas no momento da criação, mantendo o tipo correto após a criação.

---

## 📦 REPOSITÓRIOS

### 16. O que é um Repository no DDD?
**Resposta:** É uma abstração que encapsula a lógica de acesso a dados. Age como uma coleção em memória de entidades, escondendo detalhes de persistência (banco de dados, API, etc).

### 17. Por que `AnswersRepository` é uma interface e não uma classe?
**Resposta:** Seguindo o **Dependency Inversion Principle** (DIP):
- O caso de uso depende da abstração (interface), não da implementação
- Permite trocar a implementação (PostgreSQL, MongoDB, in-memory) sem alterar o caso de uso
- Facilita testes (podemos criar mocks/fakes)

### 18. O que é um "fake repository" e quando usá-lo?
**Resposta:** É uma implementação simplificada do repositório usada em testes. No código:

```typescript
const fakeAnswersRepository: AnswersRepository = {
    create: async (answer) => {
        return  // Não faz nada, apenas simula
    },
}
```

Usado para testar casos de uso sem precisar de um banco de dados real.

---

## 🎬 CASOS DE USO (USE CASES)

### 19. O que é um Use Case?
**Resposta:** Representa uma ação/operação que o sistema pode realizar. Encapsula a lógica de negócio de uma funcionalidade específica. Exemplo: "Responder uma pergunta" é um caso de uso.

### 20. Por que injetar o repository no construtor do Use Case?
**Resposta:** Isso é **Dependency Injection** (DI). Benefícios:
- Desacopla o caso de uso da implementação do repositório
- Facilita testes (podemos injetar um fake)
- Segue princípios SOLID (DIP)

```typescript
constructor(private answersRepository: AnswersRepository) { }
```

### 21. Por que o método se chama `exec()` e não `execute()` ou `run()`?
**Resposta:** É uma convenção/preferência. Poderia ser qualquer nome. O importante é ser consistente no projeto. `exec` é mais curto e direto.

### 22. Qual é o fluxo do `AnswerQuestionUseCase`?
**Resposta:**
1. Recebe os dados necessários (instructorId, questionId, content)
2. Cria uma nova entidade `Answer` usando o factory method
3. Persiste a resposta através do repositório
4. Retorna a resposta criada

---

## 🧪 TESTES

### 23. O que é Vitest?
**Resposta:** É um framework de testes moderno para JavaScript/TypeScript, similar ao Jest mas mais rápido e com melhor suporte para ESM e Vite.

### 24. Por que adicionar `"vitest/globals"` no `tsconfig.json`?
**Resposta:** Para que o TypeScript reconheça as funções globais do Vitest (`test`, `expect`, `describe`, etc) sem precisar importá-las em cada arquivo de teste.

### 25. O que testa o arquivo `answer-question.spec.ts`?
**Resposta:** Testa se o caso de uso `AnswerQuestionUseCase` consegue criar uma resposta corretamente. Verifica se o conteúdo da resposta criada corresponde ao esperado.

### 26. Por que usar um fake repository nos testes?
**Resposta:** Para isolar o teste do caso de uso. Não queremos testar o banco de dados, apenas a lógica do caso de uso. O fake simula o comportamento do repositório sem efeitos colaterais.

---

## 🔍 CONCEITOS AVANÇADOS

### 27. O que é o método `excerpt` nas entidades?
**Resposta:** Retorna um resumo do conteúdo (primeiros 120 caracteres + "..."). É um **computed property** - calculado dinamicamente a partir de outras propriedades.

```typescript
get excerpt() {
    return this.content.substring(0, 120).trimEnd().concat('...')
}
```

### 28. O que faz o método `isNew` na entidade `Question`?
**Resposta:** Verifica se a pergunta foi criada há menos de 3 dias usando a biblioteca `dayjs`. Retorna `true` se for nova, `false` caso contrário.

```typescript
get isNew() {
    return dayjs().diff(this.props.createdAt, 'day') < 3
}
```

**Nota:** Este bug foi corrigido - a unidade de tempo `'day'` foi adicionada ao método `diff()`.

### 29. Por que `bestAnswerId` é opcional em `Question`?
**Resposta:** Porque uma pergunta pode não ter uma "melhor resposta" selecionada ainda. É um campo que será preenchido posteriormente quando o autor escolher a melhor resposta.

**Como é definido:** Através do setter que também atualiza o `updatedAt`:
```typescript
set bestAnswerId(bestAnswerId: UniqueEntityID | undefined) {
    this.props.bestAnswerId = bestAnswerId
    this.touch()
}
```

**Uso prático:** O caso de uso `ChooseQuestionBestAnswerUseCase` usa esse setter para marcar a melhor resposta.

### 30. Qual a diferença entre `authorId` em `Answer` e `Question`?
**Resposta:** 
- Em `Question`: O autor é quem fez a pergunta (pode ser um Student)
- Em `Answer`: O autor é quem respondeu (pode ser um Instructor ou Student)

Ambos usam `UniqueEntityID` para manter flexibilidade - não estão acoplados a uma entidade específica.

---

## 🎓 PRINCÍPIOS SOLID APLICADOS

### 31. Quais princípios SOLID você identifica no código?

**S - Single Responsibility Principle:**
- Cada classe tem uma responsabilidade única
- `Entity` gerencia identidade, `Slug` gerencia slugs, `AnswerQuestionUseCase` gerencia criação de respostas

**O - Open/Closed Principle:**
- `Entity<T>` é aberta para extensão (novas entidades) mas fechada para modificação

**L - Liskov Substitution Principle:**
- Qualquer implementação de `AnswersRepository` pode substituir outra sem quebrar o código

**I - Interface Segregation Principle:**
- Interfaces pequenas e específicas (ex: `AnswersRepository` e `QuestionsRepository` têm métodos bem definidos)

**D - Dependency Inversion Principle:**
- Casos de uso dependem de abstrações (interfaces de repositórios), não de implementações concretas

---

## 🔐 AUTORIZAÇÃO E REGRAS DE NEGÓCIO

### 36. Por que verificar autorização nos casos de uso?
**Resposta:** Autorização é uma **regra de negócio**. Em DDD, regras de negócio pertencem ao domínio. Não é apenas uma questão técnica de segurança - é parte das regras do sistema que "apenas o autor pode editar/deletar sua própria pergunta".

### 37. Onde a autorização é verificada no código?
**Resposta:** Em 5 casos de uso diferentes:
- `EditQuestionUseCase` - apenas autor pode editar
- `DeleteQuestionUseCase` - apenas autor pode deletar
- `EditAnswerUseCase` - apenas autor pode editar resposta
- `DeleteAnswerUseCase` - apenas autor pode deletar resposta
- `ChooseQuestionBestAnswerUseCase` - apenas autor da pergunta pode escolher melhor resposta

**Padrão comum:**
```typescript
if (authorId !== question.authorId.toString()) {
    throw new Error('Not allowed.')
}
```

### 38. Esse padrão de autorização tem algum problema?
**Resposta:** Sim, há duplicação de código. O mesmo `if` aparece em 5 lugares diferentes. Possíveis melhorias:

**Opção 1: Domain Service**
```typescript
class AuthorizationService {
    ensureIsAuthor(userId: string, authorId: UniqueEntityID) {
        if (userId !== authorId.toString()) {
            throw new NotAuthorizedError()
        }
    }
}
```

**Opção 2: Método na própria entidade**
```typescript
class Question {
    isAuthor(userId: string): boolean {
        return this.authorId.toString() === userId
    }
}
```

### 39. Por que injetar `authorId` no caso de uso?
**Resposta:** O `authorId` representa o usuário autenticado que está fazendo a requisição. Normalmente vem do token JWT ou sessão. Separar "quem está fazendo" (`authorId` parâmetro) de "quem é o dono" (`entity.authorId`) permite a validação.

---

## 📄 PAGINAÇÃO E CONSULTAS

### 40. O que é paginação e por que é importante?
**Resposta:** Paginação divide grandes conjuntos de dados em "páginas" menores. É essencial para:
- Performance (não carregar milhões de registros de uma vez)
- UX (usuário navega em partes gerenciáveis)
- Escalabilidade (economiza memória e banda)

### 41. Como a paginação é implementada no projeto?
**Resposta:** Através da interface `PaginationParams` em [src/core/repositories/pagination-params.ts](src/core/repositories/pagination-params.ts):

```typescript
export interface PaginationParams {
    page?: number
    pageSize?: number
}
```

**Uso prático:**
```typescript
// No repository
findManyRecent(params: PaginationParams): Promise<Question[]>

// No use case
const { questions } = await fetchRecentQuestions.exec({
    page: 1
})
```

### 42. Por que `PaginationParams` está em `core/` e não em `domain/`?
**Resposta:** Porque paginação é um conceito genérico, reutilizável em qualquer domínio. O `core/` contém abstrações que não dependem de regras de negócio específicas. Qualquer repositório de qualquer domínio pode usar `PaginationParams`.

### 43. Qual caso de uso implementa paginação?
**Resposta:** `FetchRecentQuestionsUseCase` busca perguntas recentes com paginação:

```typescript
async exec({ page }: FetchRecentQuestionsUseCaseRequest) {
    const questions = await this.questionsRepository.findManyRecent({
        page
    })

    return { questions }
}
```

---

## 📦 EVOLUÇÃO DOS REPOSITÓRIOS

### 44. Quais métodos os repositórios têm agora?
**Resposta atualizada:**

**AnswersRepository:**
```typescript
interface AnswersRepository {
    create(answer: Answer): Promise<void>
    findById(id: string): Promise<Answer | null>
    save(answer: Answer): Promise<void>
    delete(answer: Answer): Promise<void>
}
```

**QuestionsRepository:**
```typescript
interface QuestionsRepository {
    create(question: Question): Promise<void>
    findById(id: string): Promise<Question | null>
    findBySlug(slug: string): Promise<Question | null>
    findManyRecent(params: PaginationParams): Promise<Question[]>
    save(question: Question): Promise<void>
    delete(question: Question): Promise<void>
}
```

### 45. Qual a diferença entre `create()` e `save()`?
**Resposta:** Semântica de persistência:

- **`create()`**: Primeira persistência de uma entidade nova
  - Usado em: `CreateQuestionUseCase`, `AnswerQuestionUseCase`
  - Expectativa: ID ainda não existe no banco

- **`save()`**: Atualiza uma entidade existente
  - Usado em: `EditQuestionUseCase`, `EditAnswerUseCase`, `ChooseQuestionBestAnswerUseCase`
  - Expectativa: ID já existe, atualiza campos modificados

**Exemplo prático:**
```typescript
// Criando nova pergunta
const question = Question.create({ title, content, authorId })
await repository.create(question)  // INSERT

// Editando pergunta existente
question.title = newTitle
await repository.save(question)  // UPDATE
```

### 46. Por que alguns métodos retornam a entidade e outros não?
**Resposta:** Métodos de busca (`find*`) retornam a entidade (ou `null` se não encontrada):
```typescript
findById(id: string): Promise<Question | null>
```

Métodos de mutação (`create`, `save`, `delete`) retornam `void` porque:
- A entidade já está na memória (foi passada como parâmetro)
- Não há necessidade de retornar novamente
- Foca na operação de persistência, não em recuperação de dados

### 47. Quando adicionar um novo método ao repositório?
**Resposta:** Quando um novo caso de uso precisa de uma consulta específica que não existe. Exemplos:

**Já implementado:**
- `findBySlug()` - necessário para `GetQuestionBySlugUseCase`
- `findManyRecent()` - necessário para `FetchRecentQuestionsUseCase`

**Futuras necessidades:**
- `findByAuthorId()` - para listar perguntas de um usuário
- `findByTag()` - para buscar por tags/categorias
- `countByAuthorId()` - para estatísticas de usuário

**Regra:** Cada método do repositório representa uma necessidade de acesso a dados do domínio.

---

## 🔄 CASOS DE USO COM MÚLTIPLOS REPOSITÓRIOS

### 48. Quando um caso de uso precisa de múltiplos repositórios?
**Resposta:** Quando a operação envolve múltiplas entidades/agregados. Exemplo real no projeto:

**ChooseQuestionBestAnswerUseCase:**
```typescript
constructor(
    private answersRepository: AnswersRepository,
    private questionsRepository: QuestionsRepository,
) {}
```

**Fluxo:**
1. Busca a resposta pelo ID (via `answersRepository`)
2. Busca a pergunta relacionada (via `questionsRepository`)
3. Verifica autorização (apenas autor da pergunta)
4. Define `bestAnswerId` na pergunta
5. Salva a pergunta atualizada

### 49. Isso viola o princípio de agregados do DDD?
**Resposta:** É uma questão de design. Em DDD estrito:

**Visão 1 - Answer faz parte do agregado Question:**
- `Question` seria o aggregate root
- `Answer` seria uma entidade filha
- Todas as operações em `Answer` passariam por `Question`
- Um único repositório: `QuestionsRepository`

**Visão 2 - Answer é seu próprio agregado (implementação atual):**
- `Question` e `Answer` são agregados separados
- Cada um tem seu próprio repositório
- Permite operações independentes
- Casos de uso coordenam os agregados

**Trade-offs:**
- ✅ Mais flexível: respostas podem ser manipuladas independentemente
- ✅ Melhor performance: não precisa carregar toda a question para editar answer
- ⚠️ Menos consistência: precisa coordenar transações manualmente
- ⚠️ Mais complexidade: casos de uso precisam gerenciar múltiplos repositórios

### 50. Como garantir consistência com múltiplos repositórios?
**Resposta:** Em produção, você precisaria de:

**1. Transações de banco de dados:**
```typescript
async exec({ answerId, questionId, authorId }) {
    await database.transaction(async (trx) => {
        const answer = await answersRepository.findById(answerId, trx)
        const question = await questionsRepository.findById(questionId, trx)

        // validações...

        question.bestAnswerId = answer.id
        await questionsRepository.save(question, trx)
    })
}
```

**2. Domain Events (padrão avançado):**
```typescript
// Question emite evento
question.chooseBestAnswer(answerId)  // emite BestAnswerChosenEvent

// Event handler sincroniza
on(BestAnswerChosenEvent, async (event) => {
    // atualiza estatísticas, notifica usuários, etc.
})
```

---

## ⚠️ TRATAMENTO DE ERROS

### 51. Como os erros são tratados atualmente?
**Resposta:** Uso simples de `throw new Error()`:

```typescript
if (!question) {
    throw new Error('Question not found.')
}

if (authorId !== question.authorId.toString()) {
    throw new Error('Not allowed.')
}
```

**Problemas:**
- Todos os erros são do tipo `Error` genérico
- Difícil distinguir tipos de erro no código chamador
- Mensagens inconsistentes (alguns com ponto, outros sem)
- Sem código de erro ou contexto adicional

### 52. Como melhorar o tratamento de erros?
**Resposta:** Criar classes de erro customizadas:

```typescript
// Definir erros do domínio
export class QuestionNotFoundError extends Error {
    constructor(id: string) {
        super(`Question with ID "${id}" was not found.`)
        this.name = 'QuestionNotFoundError'
    }
}

export class NotAuthorizedError extends Error {
    constructor(action: string) {
        super(`You are not authorized to ${action}.`)
        this.name = 'NotAuthorizedError'
    }
}

// Usar no caso de uso
if (!question) {
    throw new QuestionNotFoundError(questionId)
}

if (authorId !== question.authorId.toString()) {
    throw new NotAuthorizedError('edit this question')
}
```

**Benefícios:**
- Código chamador pode tratar erros específicos
- Mensagens padronizadas
- Melhor experiência de debugging
- Facilita logging e monitoramento

### 53. O que é o Result Pattern e quando usar?
**Resposta:** Alternativa a `throw` que retorna sucesso ou erro explicitamente:

```typescript
type Result<T, E> =
    | { success: true; value: T }
    | { success: false; error: E }

// Caso de uso retorna Result ao invés de throw
async exec(request): Promise<Result<Question, QuestionNotFoundError>> {
    const question = await this.repository.findById(request.id)

    if (!question) {
        return { success: false, error: new QuestionNotFoundError() }
    }

    return { success: true, value: question }
}

// Chamador verifica explicitamente
const result = await useCase.exec({ id })
if (!result.success) {
    // trata erro
    return
}
const question = result.value  // tipo seguro
```

**Quando usar:**
- Erros esperados (not found, validation)
- Quando quer forçar tratamento de erro
- Em linguagens sem exceções (Go, Rust)

**Quando NÃO usar:**
- Erros inesperados (banco caiu, out of memory)
- Pode ser verboso em JavaScript/TypeScript
- Throw é idiomático em JS

---

## 🤔 PERGUNTAS PARA REFLEXÃO

### 54. Por que não usar ORMs como Prisma diretamente nos casos de uso?
**Resposta:** Para manter o domínio independente de detalhes de infraestrutura. O repositório abstrai a persistência, permitindo trocar o ORM ou banco sem alterar as regras de negócio.

### 55. Quando você criaria um novo Value Object?
**Resposta:** Quando um conceito:
- Não tem identidade própria
- É definido apenas por seus valores
- Precisa de validações/lógica específica
- Aparece em múltiplos lugares

Exemplos: Email, CPF, Money, Address

### 56. Como você adicionaria validações nas entidades?
**Resposta:** No factory method (`create`) ou nos setters:

```typescript
static create(props: AnswerProps) {
    if (props.content.length < 10) {
        throw new Error('Resposta muito curta')
    }
    return new Answer(props)
}
```

### 35. O que falta implementar para ter um CRUD completo de respostas?
**Resposta atualizada:**

✅ **Já implementado:**
- Use cases: `EditAnswer`, `DeleteAnswer`, `AnswerQuestion`
- Métodos no repository: `findById`, `save` (update), `delete`, `create`
- Testes para cada caso de uso

❌ **Ainda falta:**
- Use cases: `GetAnswer` (buscar uma resposta específica), `ListAnswers` (listar respostas de uma pergunta)
- Métodos no repository: `findMany` (buscar múltiplas respostas por questionId)

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

### ✅ Já Implementado:
1. **Casos de uso principais:**
   - ✅ Criar pergunta (`CreateQuestionUseCase`)
   - ✅ Editar pergunta (`EditQuestionUseCase`)
   - ✅ Deletar pergunta (`DeleteQuestionUseCase`)
   - ✅ Listar perguntas recentes (`FetchRecentQuestionsUseCase`)
   - ✅ Buscar pergunta por slug (`GetQuestionBySlugUseCase`)
   - ✅ Escolher melhor resposta (`ChooseQuestionBestAnswerUseCase`)
   - ✅ Criar, editar e deletar respostas

### 🔄 Próximos Passos:

1. **Adicionar validações:**
   - Conteúdo mínimo/máximo para perguntas e respostas
   - Título obrigatório e tamanho mínimo
   - Validação de formato de slug

2. **Melhorar tratamento de erros:**
   - Criar classes de erro customizadas (`QuestionNotFoundError`, `NotAuthorizedError`)
   - Implementar Result pattern ao invés de throw direto
   - Padronizar mensagens de erro

3. **Implementar repositórios reais:**
   - Configurar Prisma
   - Criar implementações concretas dos repositories
   - Conectar com banco de dados

4. **Adicionar mais testes:**
   - Testes de validação
   - Testes de edge cases
   - Testes de integração

5. **Explorar conceitos avançados:**
   - Aggregates (Question como aggregate root com Answers)
   - Domain Events (QuestionCreated, BestAnswerChosen)
   - Specifications pattern
   - Value Objects mais complexos (Email, CPF)

6. **Refatorações sugeridas:**
   - Extrair lógica de autorização para um Domain Service
   - Implementar soft delete
   - Adicionar auditoria (created/updated by user)

---

## ✅ CHECKLIST DE CONHECIMENTO

Marque o que você já domina:

### Fundamentos de DDD
- [ ] Entendo o que é DDD e seus benefícios
- [ ] Sei diferenciar Entity de Value Object
- [ ] Compreendo o papel dos Repositories
- [ ] Entendo o que são Use Cases
- [ ] Sei quando usar Aggregates
- [ ] Compreendo Domain Events (conceito avançado)

### TypeScript
- [ ] Sei usar Generics (`<T>`)
- [ ] Entendo tipos utilitários (`Pick`, `Omit`, `Partial`, `Optional`)
- [ ] Compreendo modificadores de acesso (`private`, `protected`, `public`)
- [ ] Sei criar e usar interfaces
- [ ] Entendo union types e type guards

### Arquitetura
- [ ] Entendo a separação entre `core` e `domain`
- [ ] Compreendo Dependency Injection
- [ ] Sei aplicar princípios SOLID
- [ ] Entendo a importância de abstrações
- [ ] Sei organizar camadas (Enterprise, Application, Infrastructure)

### Repositórios
- [ ] Entendo a diferença entre `create()` e `save()`
- [ ] Sei quando adicionar novos métodos ao repositório
- [ ] Compreendo consultas com paginação
- [ ] Entendo o retorno `Promise<T | null>` vs `Promise<T[]>`

### Casos de Uso
- [ ] Sei criar casos de uso seguindo o padrão do projeto
- [ ] Entendo quando injetar múltiplos repositórios
- [ ] Compreendo validações e regras de negócio
- [ ] Sei implementar autorização em casos de uso

### Testes
- [ ] Sei escrever testes unitários
- [ ] Entendo o conceito de mocks/fakes
- [ ] Compreendo a importância de testar casos de uso
- [ ] Sei configurar Vitest
- [ ] Sei testar casos de erro e exceções
- [ ] Entendo testes de autorização

### Conceitos Avançados
- [ ] Entendo o trade-off entre agregados separados vs aninhados
- [ ] Compreendo tratamento de erros (custom errors vs throw)
- [ ] Sei quando usar Result Pattern
- [ ] Entendo Domain Services
- [ ] Compreendo transações entre múltiplos repositórios

---

## 📝 EXERCÍCIOS PRÁTICOS

### Exercício 1: ✅ Criar novo Use Case (CONCLUÍDO)
~~Implemente o caso de uso `CreateQuestionUseCase` seguindo o padrão do `AnswerQuestionUseCase`.~~
**Status:** Implementado em [src/domain/forum/application/use-cases/create-question.ts](src/domain/forum/application/use-cases/create-question.ts)

### Exercício 2: Adicionar validação
Adicione validação no `Answer.create()` para garantir que o conteúdo tenha no mínimo 20 caracteres.

**Dicas:**
```typescript
static create(props: Optional<AnswerProps, 'createdAt'>, id?: UniqueEntityID) {
    if (props.content.length < 20) {
        throw new Error('Answer content must have at least 20 characters')
    }
    // resto da implementação
}
```

### Exercício 3: Novo Value Object
Crie um Value Object `Email` com validação de formato.

**Estrutura sugerida:**
```typescript
export class Email {
    private readonly value: string

    private constructor(value: string) {
        this.value = value
    }

    static create(email: string): Email {
        if (!this.isValid(email)) {
            throw new Error('Invalid email format')
        }
        return new Email(email.toLowerCase().trim())
    }

    private static isValid(email: string): boolean {
        // implementar regex de validação
    }

    toString(): string {
        return this.value
    }
}
```

### Exercício 4: Teste com erro
Escreva um teste que verifica se a validação do exercício 2 funciona corretamente.

**Exemplo:**
```typescript
test('should not create answer with content less than 20 characters', () => {
    expect(() => {
        Answer.create({
            content: 'Short content',
            questionId: new UniqueEntityID(),
            authorId: new UniqueEntityID()
        })
    }).toThrow('Answer content must have at least 20 characters')
})
```

### Exercício 5: ✅ Método no Repository (CONCLUÍDO)
~~Adicione o método `findById(id: string): Promise<Answer | null>` na interface `AnswersRepository`.~~
**Status:** Implementado em [src/domain/forum/application/repositories/answers-repository.ts](src/domain/forum/application/repositories/answers-repository.ts)

### Exercício 6: NOVO - Refatorar Autorização
Crie um `AuthorizationService` no domínio para eliminar duplicação de código de autorização.

**Estrutura sugerida:**
```typescript
// src/domain/forum/application/services/authorization-service.ts
export class AuthorizationService {
    ensureIsAuthor(userId: string, authorId: UniqueEntityID): void {
        if (userId !== authorId.toString()) {
            throw new NotAuthorizedError()
        }
    }
}

// Uso nos casos de uso
constructor(
    private repository: QuestionsRepository,
    private authService: AuthorizationService
) {}

async exec({ questionId, authorId, title, content }) {
    const question = await this.repository.findById(questionId)
    if (!question) throw new QuestionNotFoundError(questionId)

    this.authService.ensureIsAuthor(authorId, question.authorId)
    // resto da lógica
}
```

### Exercício 7: NOVO - Implementar Custom Errors
Crie classes de erro customizadas para substituir os `throw new Error()` genéricos.

**Criar:**
- `QuestionNotFoundError`
- `AnswerNotFoundError`
- `NotAuthorizedError`
- `ValidationError`

**Localização sugerida:** `src/domain/forum/application/errors/`

### Exercício 8: NOVO - Adicionar Testes de Autorização
Adicione testes para verificar que usuários não-autorizados não podem editar/deletar recursos de outros.

**Exemplo:**
```typescript
test('should not edit question from another author', async () => {
    const question = Question.create({
        authorId: new UniqueEntityID('author-1'),
        title: 'Original',
        content: 'Content'
    })
    await repository.create(question)

    await expect(
        editQuestion.exec({
            questionId: question.id.toString(),
            authorId: 'author-2',  // Autor diferente
            title: 'Hacked',
            content: 'Hacked'
        })
    ).rejects.toThrow('Not allowed')
})
```

### Exercício 9: NOVO - Implementar Listagem de Respostas
Crie o caso de uso `FetchQuestionAnswersUseCase` que lista todas as respostas de uma pergunta com paginação.

**Passos:**
1. Adicionar método `findManyByQuestionId(questionId: string, params: PaginationParams)` no `AnswersRepository`
2. Criar o caso de uso
3. Escrever testes

### Exercício 10: NOVO - Bug do Slug
Corrija o bug na regex do `Slug.createFromText()` (linha 18 de [src/domain/forum/enterprise/entities/value-objects/slug.ts](src/domain/forum/enterprise/entities/value-objects/slug.ts)):

**Código atual (incorreto):**
```typescript
.replace(/\[^\w-]+/g, '')  // Bracket escapado é literal
```

**Deve ser:**
```typescript
.replace(/[^\w-]+/g, '')  // Character class correta
```

---

## 🎯 CONCLUSÃO

Este projeto implementa os fundamentos de DDD de forma prática e incremental. Os conceitos principais são:

### Conceitos Fundamentais
1. **Separação de responsabilidades** (core vs domain)
2. **Entidades com identidade** (Entity base class)
3. **Value Objects** (Slug, UniqueEntityID)
4. **Casos de uso** (orquestração de lógica de negócio)
5. **Repositórios** (abstração de persistência)
6. **Testes** (garantia de qualidade)

### Conceitos Avançados Implementados
7. **Autorização como regra de negócio** (verificação de ownership)
8. **Paginação** (consultas escaláveis)
9. **Múltiplos repositórios** (coordenação entre agregados)
10. **Setters com side effects** (atualização automática de campos relacionados)
11. **Consultas especializadas** (findBySlug, findManyRecent)

### Estatísticas do Projeto
- **9 casos de uso** implementados e testados
- **4 entidades** de domínio (Question, Answer, Student, Instructor)
- **2 value objects** (Slug, UniqueEntityID)
- **2 repositórios** com 10 métodos no total
- **1 padrão de paginação** reutilizável
- **100% cobertura de testes** nos casos de uso

### Evolução do Projeto
Este guia foi atualizado para refletir a evolução do projeto desde sua criação. Novos conceitos foram adicionados:

✅ Seção sobre **Autorização e Regras de Negócio** (perguntas 36-39)
✅ Seção sobre **Paginação e Consultas** (perguntas 40-43)
✅ Seção sobre **Evolução dos Repositórios** (perguntas 44-47)
✅ Seção sobre **Casos de Uso com Múltiplos Repositórios** (perguntas 48-50)
✅ Seção sobre **Tratamento de Erros** (perguntas 51-53)
✅ **6 novos exercícios práticos** adicionados
✅ **Checklist expandido** com conceitos avançados

### Próximos Desafios
Para continuar evoluindo o projeto:
1. Implementar classes de erro customizadas
2. Refatorar autorização para um Domain Service
3. Adicionar validações nas entidades
4. Implementar repositórios reais com Prisma
5. Explorar Domain Events
6. Adicionar camada de apresentação (API REST)

Continue praticando e expandindo o projeto para solidificar esses conceitos! 🚀

---

## 📚 REFERÊNCIAS E RECURSOS

### Livros Recomendados
- **Domain-Driven Design** - Eric Evans (O livro azul)
- **Implementing Domain-Driven Design** - Vaughn Vernon (O livro vermelho)
- **Clean Architecture** - Robert C. Martin

### Artigos e Recursos Online
- [Martin Fowler - Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Microsoft - DDD Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)
- [DDD Community](https://github.com/ddd-crew)

### Padrões Relacionados
- **CQRS** (Command Query Responsibility Segregation)
- **Event Sourcing**
- **Hexagonal Architecture** (Ports & Adapters)
- **Clean Architecture**

---

**Última atualização:** 2025-01-12
**Versão do guia:** 2.0 - Atualizado com implementações avançadas
