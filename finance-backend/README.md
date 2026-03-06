# Finance Backend

Estrutura inicial do backend do projeto Finance com foco em cadastro de usuário.

## Stack

- Node.js 22
- TypeScript
- Express
- SQLite

## Funcionalidade implementada

- `POST /users/register`: cadastro de usuário com:
  - validação de entrada;
  - normalização de e-mail;
  - hash de senha;
  - verificação de e-mail único.

## Estrutura de módulos

Organização baseada em módulos dentro de `src`:

- `src/user/`
  - `domain/`
  - `application/`
  - `infrastructure/`
  - `presentation/`
- `src/bill/`
  - `domain/`
  - `application/`
  - `infrastructure/`
  - `presentation/`
- `src/shared/`
  - componentes compartilhados (ex.: erros de domínio, conexão de banco e migrações)
- `src/main/`
  - bootstrap da aplicação

## Configuração

1. Copie o ambiente:

```bash
cp .env.example .env
```

2. Instale dependências:

```bash
npm install
```

3. Execute a migração:

```bash
npm run migrate
```

4. Inicie em desenvolvimento:

```bash
npm run dev
```

## Exemplo de requisição

`POST /users/register`

```json
{
  "name": "Maria Silva",
  "email": "maria@finance.com",
  "password": "123456"
}
```
