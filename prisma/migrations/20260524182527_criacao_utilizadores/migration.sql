-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'DOING', 'DONE');

-- CreateEnum
CREATE TYPE "classe_utilizador" AS ENUM ('MEMBRO', 'LIDER');

-- CreateEnum
CREATE TYPE "FeedTipo" AS ENUM ('TAREFA_EM_PROGRESSO', 'TAREFA_CONCLUIDA', 'SUBTAREFA_CONCLUIDA', 'TAREFA_PARTILHADA', 'DESAFIO_CONCLUIDO', 'BADGE_RECEBIDO');

-- CreateTable
CREATE TABLE "utilizadores" (
    "id_utilizador" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "suspenso" BOOLEAN NOT NULL DEFAULT false,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "utilizadores_pkey" PRIMARY KEY ("id_utilizador")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIA',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtasks" (
    "id_subtask" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_tarefa" INTEGER NOT NULL,

    CONSTRAINT "subtasks_pkey" PRIMARY KEY ("id_subtask")
);

-- CreateTable
CREATE TABLE "AiResponse" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "id_tarefa" INTEGER,
    "id_user" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id_notificacao" SERIAL NOT NULL,
    "id_target" INTEGER NOT NULL,
    "mensagem" TEXT,
    "ficheiro_enviado" INTEGER,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "recebida_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id_notificacao")
);

-- CreateTable
CREATE TABLE "ChatGroup" (
    "group_id" INTEGER NOT NULL,
    "msg" TEXT NOT NULL,
    "sendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" INTEGER,

    CONSTRAINT "ChatGroup_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "desafios" (
    "id_desafio" SERIAL NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "badge" TEXT NOT NULL,
    "notificar" BOOLEAN NOT NULL DEFAULT false,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "desafios_pkey" PRIMARY KEY ("id_desafio")
);

-- CreateTable
CREATE TABLE "desafio_participacoes" (
    "id_participacao" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_desafio" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "desafio_participacoes_pkey" PRIMARY KEY ("id_participacao")
);

-- CreateTable
CREATE TABLE "reports" (
    "id_report" SERIAL NOT NULL,
    "id_reportado_por" INTEGER NOT NULL,
    "id_reportado" INTEGER NOT NULL,
    "id_tarefa" INTEGER,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "relevancia" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id_report")
);

-- CreateTable
CREATE TABLE "ficheiros_submetidos" (
    "id_ficheiro" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "nome" TEXT,
    "id_tarefa" INTEGER NOT NULL,
    "nome_ficheiro" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mensagem_commit" TEXT,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ficheiros_submetidos_pkey" PRIMARY KEY ("id_ficheiro")
);

-- CreateTable
CREATE TABLE "conflitos_ficheiros" (
    "id_conflito" SERIAL NOT NULL,
    "id_tarefa" INTEGER NOT NULL,
    "nome_ficheiro" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,
    "mensagem_commit" TEXT,
    "id_versao_escolhida" INTEGER,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "conflitos_ficheiros_pkey" PRIMARY KEY ("id_conflito")
);

-- CreateTable
CREATE TABLE "merge_ficheiros" (
    "id_merge" SERIAL NOT NULL,
    "id_tarefa" INTEGER NOT NULL,
    "criado_por" INTEGER NOT NULL,
    "tamanho" TEXT NOT NULL,
    "ficheiros_incluidos" TEXT NOT NULL,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merge_ficheiros_pkey" PRIMARY KEY ("id_merge")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "grupo_id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("grupo_id")
);

-- CreateTable
CREATE TABLE "UtilizadorGrupo" (
    "gr_id" INTEGER NOT NULL,
    "ut_id" INTEGER NOT NULL,
    "quandoEntrou" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classe" "classe_utilizador" NOT NULL DEFAULT 'MEMBRO',

    CONSTRAINT "UtilizadorGrupo_pkey" PRIMARY KEY ("gr_id","ut_id")
);

-- CreateTable
CREATE TABLE "feed_publicacoes" (
    "id_publicacao" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_tarefa" INTEGER,
    "id_subtask" INTEGER,
    "id_desafio" INTEGER,
    "tipo" "FeedTipo" NOT NULL,
    "comentario" TEXT,
    "quer_participantes" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_publicacoes_pkey" PRIMARY KEY ("id_publicacao")
);

-- CreateTable
CREATE TABLE "feed_likes" (
    "id_like" SERIAL NOT NULL,
    "id_publicacao" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_likes_pkey" PRIMARY KEY ("id_like")
);

-- CreateTable
CREATE TABLE "feed_comentarios" (
    "id_comentario" SERIAL NOT NULL,
    "id_publicacao" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_comentarios_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateTable
CREATE TABLE "seguidores" (
    "seguido_id" INTEGER NOT NULL,
    "seguidor_id" INTEGER NOT NULL,
    "criadoEM" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguidores_pkey" PRIMARY KEY ("seguido_id","seguidor_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_email_key" ON "utilizadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_handle_key" ON "utilizadores"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "notificacoes_ficheiro_enviado_key" ON "notificacoes"("ficheiro_enviado");

-- CreateIndex
CREATE UNIQUE INDEX "ChatGroup_file_key" ON "ChatGroup"("file");

-- CreateIndex
CREATE UNIQUE INDEX "desafio_participacoes_id_user_id_desafio_key" ON "desafio_participacoes"("id_user", "id_desafio");

-- CreateIndex
CREATE UNIQUE INDEX "feed_likes_id_publicacao_id_user_key" ON "feed_likes"("id_publicacao", "id_user");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiResponse" ADD CONSTRAINT "AiResponse_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiResponse" ADD CONSTRAINT "AiResponse_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_ficheiro_enviado_fkey" FOREIGN KEY ("ficheiro_enviado") REFERENCES "ficheiros_submetidos"("id_ficheiro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_id_target_fkey" FOREIGN KEY ("id_target") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroup" ADD CONSTRAINT "ChatGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Grupo"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroup" ADD CONSTRAINT "ChatGroup_file_fkey" FOREIGN KEY ("file") REFERENCES "ficheiros_submetidos"("id_ficheiro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafios" ADD CONSTRAINT "desafios_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafio_participacoes" ADD CONSTRAINT "desafio_participacoes_id_desafio_fkey" FOREIGN KEY ("id_desafio") REFERENCES "desafios"("id_desafio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafio_participacoes" ADD CONSTRAINT "desafio_participacoes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_id_reportado_fkey" FOREIGN KEY ("id_reportado") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_id_reportado_por_fkey" FOREIGN KEY ("id_reportado_por") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficheiros_submetidos" ADD CONSTRAINT "ficheiros_submetidos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflitos_ficheiros" ADD CONSTRAINT "conflitos_ficheiros_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merge_ficheiros" ADD CONSTRAINT "merge_ficheiros_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizadorGrupo" ADD CONSTRAINT "UtilizadorGrupo_gr_id_fkey" FOREIGN KEY ("gr_id") REFERENCES "Grupo"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizadorGrupo" ADD CONSTRAINT "UtilizadorGrupo_ut_id_fkey" FOREIGN KEY ("ut_id") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_publicacoes" ADD CONSTRAINT "feed_publicacoes_id_desafio_fkey" FOREIGN KEY ("id_desafio") REFERENCES "desafios"("id_desafio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_publicacoes" ADD CONSTRAINT "feed_publicacoes_id_subtask_fkey" FOREIGN KEY ("id_subtask") REFERENCES "subtasks"("id_subtask") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_publicacoes" ADD CONSTRAINT "feed_publicacoes_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_publicacoes" ADD CONSTRAINT "feed_publicacoes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_id_publicacao_fkey" FOREIGN KEY ("id_publicacao") REFERENCES "feed_publicacoes"("id_publicacao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comentarios" ADD CONSTRAINT "feed_comentarios_id_publicacao_fkey" FOREIGN KEY ("id_publicacao") REFERENCES "feed_publicacoes"("id_publicacao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comentarios" ADD CONSTRAINT "feed_comentarios_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_seguido_id_fkey" FOREIGN KEY ("seguido_id") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_seguidor_id_fkey" FOREIGN KEY ("seguidor_id") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;
