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

**Nota:** Há um bug no código - falta a unidade de tempo:
```typescript
// Código atual (incorreto):
return dayjs().diff(this.props.createdAt) < 3

// Deveria ser:
return dayjs().diff(this.props.createdAt, 'days') < 3
```

### 29. Por que `bestAnswerId` é opcional em `Question`?
**Resposta:** Porque uma pergunta pode não ter uma "melhor resposta" selecionada ainda. É um campo que será preenchido posteriormente quando o autor escolher a melhor resposta.

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
- Interfaces pequenas e específicas (ex: `AnswersRepository` tem apenas `create`)

**D - Dependency Inversion Principle:**
- `AnswerQuestionUseCase` depende da abstração (`AnswersRepository`), não da implementação concreta

---

## 🤔 PERGUNTAS PARA REFLEXÃO

### 32. Por que não usar ORMs como Prisma diretamente nos casos de uso?
**Resposta:** Para manter o domínio independente de detalhes de infraestrutura. O repositório abstrai a persistência, permitindo trocar o ORM ou banco sem alterar as regras de negócio.

### 33. Quando você criaria um novo Value Object?
**Resposta:** Quando um conceito:
- Não tem identidade própria
- É definido apenas por seus valores
- Precisa de validações/lógica específica
- Aparece em múltiplos lugares

Exemplos: Email, CPF, Money, Address

### 34. Como você adicionaria validações nas entidades?
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
**Resposta:**
- Use cases: `EditAnswer`, `DeleteAnswer`, `GetAnswer`, `ListAnswers`
- Métodos no repository: `findById`, `findMany`, `update`, `delete`
- Testes para cada caso de uso

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

1. **Implementar mais casos de uso:**
   - Criar pergunta
   - Editar pergunta
   - Deletar pergunta
   - Listar perguntas

2. **Adicionar validações:**
   - Conteúdo mínimo/máximo
   - Título obrigatório
   - Verificar se autor existe

3. **Implementar repositórios reais:**
   - Configurar Prisma
   - Criar implementações concretas dos repositories
   - Conectar com banco de dados

4. **Adicionar mais testes:**
   - Testes de validação
   - Testes de edge cases
   - Testes de integração

5. **Explorar conceitos avançados:**
   - Aggregates
   - Domain Events
   - Specifications
   - Value Objects mais complexos

---

## ✅ CHECKLIST DE CONHECIMENTO

Marque o que você já domina:

### Fundamentos
- [ ] Entendo o que é DDD e seus benefícios
- [ ] Sei diferenciar Entity de Value Object
- [ ] Compreendo o papel dos Repositories
- [ ] Entendo o que são Use Cases

### TypeScript
- [ ] Sei usar Generics (`<T>`)
- [ ] Entendo tipos utilitários (`Pick`, `Omit`, `Partial`)
- [ ] Compreendo modificadores de acesso (`private`, `protected`, `public`)
- [ ] Sei criar e usar interfaces

### Arquitetura
- [ ] Entendo a separação entre `core` e `domain`
- [ ] Compreendo Dependency Injection
- [ ] Sei aplicar princípios SOLID
- [ ] Entendo a importância de abstrações

### Testes
- [ ] Sei escrever testes unitários
- [ ] Entendo o conceito de mocks/fakes
- [ ] Compreendo a importância de testar casos de uso
- [ ] Sei configurar Vitest

---

## 📝 EXERCÍCIOS PRÁTICOS

### Exercício 1: Criar novo Use Case
Implemente o caso de uso `CreateQuestionUseCase` seguindo o padrão do `AnswerQuestionUseCase`.

### Exercício 2: Adicionar validação
Adicione validação no `Answer.create()` para garantir que o conteúdo tenha no mínimo 20 caracteres.

### Exercício 3: Novo Value Object
Crie um Value Object `Email` com validação de formato.

### Exercício 4: Teste com erro
Escreva um teste que verifica se a validação do exercício 2 funciona corretamente.

### Exercício 5: Método no Repository
Adicione o método `findById(id: string): Promise<Answer | null>` na interface `AnswersRepository`.

---

## 🎯 CONCLUSÃO

Este projeto implementa os fundamentos de DDD de forma prática e incremental. Os conceitos principais são:

1. **Separação de responsabilidades** (core vs domain)
2. **Entidades com identidade** (Entity base class)
3. **Value Objects** (Slug, UniqueEntityID)
4. **Casos de uso** (orquestração de lógica de negócio)
5. **Repositórios** (abstração de persistência)
6. **Testes** (garantia de qualidade)

Continue praticando e expandindo o projeto para solidificar esses conceitos! 🚀
