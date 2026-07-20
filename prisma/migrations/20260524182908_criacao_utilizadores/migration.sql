/*
  Warnings:

  - You are about to drop the `ChatGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatGroup" DROP CONSTRAINT "ChatGroup_file_fkey";

-- DropForeignKey
ALTER TABLE "ChatGroup" DROP CONSTRAINT "ChatGroup_group_id_fkey";

-- DropTable
DROP TABLE "ChatGroup";

-- CreateTable
CREATE TABLE "NotificacaoGroup" (
    "group_id" INTEGER NOT NULL,
    "msg" TEXT NOT NULL,
    "sendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" INTEGER,

    CONSTRAINT "NotificacaoGroup_pkey" PRIMARY KEY ("group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificacaoGroup_file_key" ON "NotificacaoGroup"("file");

-- AddForeignKey
ALTER TABLE "NotificacaoGroup" ADD CONSTRAINT "NotificacaoGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Grupo"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacaoGroup" ADD CONSTRAINT "NotificacaoGroup_file_fkey" FOREIGN KEY ("file") REFERENCES "ficheiros_submetidos"("id_ficheiro") ON DELETE SET NULL ON UPDATE CASCADE;
