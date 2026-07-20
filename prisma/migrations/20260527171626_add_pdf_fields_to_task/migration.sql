/*
  Warnings:

  - The values [TODO] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `NotificacaoGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING', 'DOING', 'DONE');
ALTER TABLE "public"."task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "NotificacaoGroup" DROP CONSTRAINT "NotificacaoGroup_file_fkey";

-- DropForeignKey
ALTER TABLE "NotificacaoGroup" DROP CONSTRAINT "NotificacaoGroup_group_id_fkey";

-- DropForeignKey
ALTER TABLE "notificacoes" DROP CONSTRAINT "notificacoes_ficheiro_enviado_fkey";

-- DropIndex
DROP INDEX "notificacoes_ficheiro_enviado_key";

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "id_grupo" INTEGER,
ADD COLUMN     "pdfName" TEXT,
ADD COLUMN     "pdfPath" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropTable
DROP TABLE "NotificacaoGroup";

-- CreateTable
CREATE TABLE "Conversas" (
    "chat_id" SERIAL NOT NULL,
    "user2_id" INTEGER NOT NULL,
    "msg_history" TEXT NOT NULL,
    "updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversas_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "ChatGroup" (
    "grupo_id" INTEGER NOT NULL,
    "chat_msg_history" TEXT[],
    "user_msg" INTEGER[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "history_chat" TEXT[],

    CONSTRAINT "ChatGroup_pkey" PRIMARY KEY ("grupo_id")
);

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "Grupo"("grupo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversas" ADD CONSTRAINT "Conversas_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "utilizadores"("id_utilizador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroup" ADD CONSTRAINT "ChatGroup_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "Grupo"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
