import { prisma } from '../lib/prisma.js';

/** 
 * Obtem todas as notificações do sistema
 * @returns Lista de notificações ordenadas (mais recentes primeiro)
 */
export const getNotifications = async (id_user: number) => {
  return prisma.notificacao.findMany({
    where: { id_user },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Obtem uma notificação específica pelo seu ID
 * @param id_notificacao - ID da notificação a ser obtida
 * @returns Notificação ou null se não existir
*/
export const getNotificationById = async (id_notificacao: number, id_user: number) => {
  return prisma.notificacao.findFirst({
    where: {
      id_notificacao,
      id_user,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Cria uma nova notificação
 * @param id_user - ID do usuário destinatário da notificação
 * @param tipo - Tipo da notificação (ex: info,alerta,sucesso)
 * @param mensagem - Conteúdo da notificação
 * @returns Notificação criada
*/
export const createNotification = async (
  id_user: number,
  tipo: string,
  mensagem: string
) => {
  return prisma.notificacao.create({
    data: {
      id_user,
      tipo,
      mensagem,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Marca uma notificação como lida
 * @param id_notificacao - ID da notificação 
 * @returns Notificação atualizada
*/
export const markNotificationAsRead = async (
  id_notificacao: number,
  id_user: number
) => {
  const notification = await prisma.notificacao.findFirst({
    where: {
      id_notificacao,
      id_user,
    },
  });

  if (!notification) {
    throw new Error('Notificação não encontrada');
  }

  return prisma.notificacao.update({
    where: { id_notificacao },
    data: {
      lida: true,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Marca todas as notificações como lidas
 * @returns Lista de notificações atualizadas
 */
export const markAllNotificationsAsRead = async (id_user: number) => {
  return prisma.notificacao.updateMany({
    where: { id_user },
    data: {
      lida: true,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Remove uma notificação pelo seu ID
 * @param id_notificacao - ID da notificação a ser removida
 * @returns Notificação eliminada 
*/
export const deleteNotification = async (
  id_notificacao: number,
  id_user: number
) => {
  const notification = await prisma.notificacao.findFirst({
    where: {
      id_notificacao,
      id_user,
    },
  });

  if (!notification) {
    throw new Error('Notificação não encontrada');
  }

  return prisma.notificacao.delete({
    where: { id_notificacao },
  });
};

export const createNotificationGroup = (grupo_id:number, msg:string, file: number | null) => {
  return prisma.notificacaoGroup.create({data:{group_id:grupo_id, msg:msg, file:file}});
};

export const getAllNotificationGroup = (grupo_id:number) => {
  return prisma.notificacaoGroup.findMany({where:{group_id:grupo_id},});
};

export const deleteAllNotificationGroup = (grupo_id:number) => {
  return prisma.notificacaoGroup.deleteMany({where: {group_id:grupo_id},});
};



