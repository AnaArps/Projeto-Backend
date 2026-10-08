# Restaurant Ordering System - API

## 1. Ana Gabriela Rodrigues Harps 

**Restaurant Ordering System** é uma API REST para um sistema de autoatendimento de restaurante.

- **Problema:** em um restaurante com autoatendimento, o cardápio precisa estar organizado e disponível para consulta e gerenciamento de forma simples.
- **Contexto:** projeto da disciplina de Desenvolvimento Back-End (4P - Engenharia de Software - Campus SJP).
- **Objetivo da API:** cadastrar, consultar, atualizar e remover as **categorias** do cardápio e os **produtos** de cada categoria, persistindo os dados no Supabase/PostgreSQL.

## 2. Identificação do estudante

**Nome completo:** Mateus R. Pereira *(substituir pelo nome completo, se necessário)*

## 3. Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Supabase (`@supabase/supabase-js`)
- PostgreSQL
- Git

## 4. Entidades e relacionamentos

### Category (categories)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador (PK) |
| name | texto | Nome da categoria |
| description | texto | Descrição da categoria |
| icon | texto | Ícone (emoji) |
| display_order | inteiro | Ordem de exibição |
| active | booleano | Categoria ativa |

### Product (products)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador (PK) |
| categoryId | UUID | Categoria do produto (FK -> categories.id) |
| name | texto | Nome do produto (obrigatório) |
| description | texto | Descrição do produto |
| price | numérico | Preço (obrigatório, maior ou igual a 0) |
| image | texto | Imagem do produto |
| available | booleano | Produto disponível |
| active | booleano | Produto ativo |

### Relacionamento

```
categories (1) ───────< (N) products
```

Uma **categoria** possui vários **produtos**; cada **produto** pertence a exatamente uma categoria (chave estrangeira `products.categoryId`).

## 5. Estrutura do projeto

```
src/
├── config/          # Configuração do cliente Supabase
├── controller/      # Tratamento das requisições e respostas HTTP (+ validações)
├── model/           # Representação das entidades (Category, Product)
├── repositories/    # Acesso e persistência dos dados no Supabase
├── routes/          # Definição dos endpoints
├── app.ts           # Configuração do Express e registro das rotas
└── server.ts        # Inicialização do servidor
```

## 6. Configuração e execução

```bash
git clone https://github.com/matthewrpereira/restaurant_ordering_system_sjp.git
cd restaurant_ordering_system_sjp
npm install
cp .env.example .env     # depois preencher com as credenciais reais
npm run dev
```

O servidor sobe em `http://localhost:3000`.

Outros scripts: `npm run build` (compila para `dist/`) e `npm start` (executa `dist/server.js`).

## 7. Variáveis de ambiente

Crie um arquivo `.env` na raiz (baseado no `.env.example`). Ele **não** é enviado ao Git (está no `.gitignore`).

| Variável | Descrição |
|---|---|
| SUPABASE_URL | URL do projeto no Supabase |
| SUPABASE_SECRET_KEY | Chave secreta do Supabase |

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SECRET_KEY=sua_chave_secreta
```

## 8. Banco de dados

Script para criar as tabelas no Supabase (SQL Editor):

```sql
create table categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    icon text,
    display_order integer,
    active boolean not null default true
);

create table products (
    id uuid primary key default gen_random_uuid(),
    "categoryId" uuid not null references categories(id),
    name text not null,
    description text,
    price numeric(10,2) not null check (price >= 0),
    image text,
    available boolean not null default true,
    active boolean not null default true
);
```

Relacionamento: `products."categoryId"` referencia `categories.id`. Se a categoria informada não existir, a API retorna `400`.

## 9. Documentação dos endpoints

### Categories

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /categories | Lista todas as categorias |
| GET | /categories/search?keyword=texto | Pesquisa categorias por palavra-chave (nome/descrição) |
| GET | /categories/:id | Consulta uma categoria pelo ID |
| POST | /categories | Cadastra uma categoria |
| PUT | /categories/:id | Atualiza uma categoria |
| DELETE | /categories/:id | Remove uma categoria |

### Products

| Método | Endpoint | Descrição |
|---|---|---|
| GET | /products | Lista todos os produtos |
| GET | /products/search?keyword=texto | Pesquisa produtos por palavra-chave (nome/descrição) |
| GET | /products/:id | Consulta um produto pelo ID |
| POST | /products | Cadastra um produto (exige `categoryId`, `name`, `price`) |
| PUT | /products/:id | Atualiza um produto (exige `categoryId`, `name`, `price`) |
| DELETE | /products/:id | Remove um produto |

### Códigos de resposta

| Código | Quando |
|---|---|
| 200 | Consulta, atualização ou exclusão realizada |
| 201 | Registro criado |
| 400 | Dados inválidos, palavra-chave ausente ou categoria inexistente |
| 404 | Registro não encontrado |
| 500 | Erro interno |

## 10. Exemplos de requisições

**POST /categories**
```json
{
    "name": "Pizzas",
    "description": "Pizzas artesanais com diversos sabores e ingredientes.",
    "icon": "🍕",
    "display_order": 1,
    "active": true
}
```

**PUT /categories/:id**
```json
{
    "name": "Pizzas especiais",
    "description": "Pizzas tradicionais e especiais"
}
```

**POST /products**
```json
{
    "categoryId": "UUID-DA-CATEGORIA",
    "name": "Pizza de chocolate",
    "description": "Pizza doce com chocolate.",
    "price": 35.9,
    "image": "pizza-chocolate.jpg",
    "available": true,
    "active": true
}
```

**PUT /products/:id**
```json
{
    "categoryId": "UUID-DA-CATEGORIA",
    "name": "Pizza de chocolate - atualizada",
    "description": "Pizza doce com chocolate e morango.",
    "price": 39.9
}
```

**Resposta de erro de validação (400)**
```json
{
    "message": "O campo name é obrigatório."
}
```
