
# CONFIGURAÇÃO DO PROJETO

## 1º Baixar a pasta do projeto

## 2º Dentro da pasta do projeto, abrir o terminal e executar:
<code> npm install </code>

## 3º Criar um ficheiro .env na raiz do projeto e adicionar a string de ligação à base de dados:
<code> DATABASE_URL="sua_string_de_conexao" </code>

## 4º Gerar o cliente Prisma:
<code> npx prisma generate </code>

## 5º Aplicar as migrações da base de dados (schema.prisma):
<code> npx prisma migrate dev </code>

## 6º Atualizar o cliente Prisma (sempre que houver alterações no schema):
<code> npx prisma generate </code>

## 7º Iniciar o servidor:
<code> npx tsx watch src/server.ts </code>