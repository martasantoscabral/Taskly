/*
  Warnings:

  - You are about to drop the `ChatGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatGroup" DROP CONSTRAINT "ChatGroup_grupo_id_fkey";

-- DropTable
DROP TABLE "ChatGroup";

-- CreateTable
CREATE TABLE "mensagens_grupo" (
    "id_mensagem" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grupo_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "mensagens_grupo_pkey" PRIMARY KEY ("id_mensagem")
);

-- CreateIndex
CREATE INDEX "mensagens_grupo_grupo_id_idx" ON "mensagens_grupo"("grupo_id");

-- CreateIndex
CREATE INDEX "mensagens_grupo_user_id_idx" ON "mensagens_grupo"("user_id");

-- AddForeignKey
ALTER TABLE "mensagens_grupo" ADD CONSTRAINT "mensagens_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "Grupo"("grupo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_grupo" ADD CONSTRAINT "mensagens_grupo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilizadores"("id_utilizador") ON DELETE CASCADE ON UPDATE CASCADE;
