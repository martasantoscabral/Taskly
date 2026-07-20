import { prisma } from '../lib/prisma.js';


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Obtem todos os reports do sistema (incluindo os detalhes)
 * 
 * @returns Lista de reports com informações dos utilizadores (mais recente primeiro).
*/  
export const getReports = async () => {
  return prisma.report.findMany({
    include: {
      reportadoPor: true,
      reportado: true,
      tarefa: true,
    },
    orderBy: {
      data: 'desc',
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Obtem os detalhes de um report específico pelo ID.
 * 
 * @param id_report ID do report a obter.
 * @returns Report ou null se nao existir.
*/
export const getReportById = async (id_report: number) => {
  return prisma.report.findUnique({
    where: { id_report },
    include: {
      reportadoPor: true,
      reportado: true,
      tarefa: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Cria um novo report.
 * 
 * @param id_reportado_por ID do utilizador que fez o report.
 * @param id_reportado ID do utilizador que foi reportado.
 * @param id_tarefa ID da tarefa associada ao report.
 * @param tipo Tipo do report (ex: denuncia, abuso, spam etc...).
 * @param status Estado atual do report (ex:pendente).
 * @param relevancia Relevância do report (ex:alta, media).
 * @returns O report criado.
*/  
export const createReport = async (
  id_reportado_por: number,
  id_reportado: number,
  id_tarefa: number  | undefined,
  tipo: string,
  status: string,
  relevancia: string
) => {
  return prisma.report.create({
    data: {
      id_reportado_por,
      id_reportado,
      id_tarefa,
      tipo,
      status,
      relevancia,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Atualiza o status de um report.
 * @param id_report ID do report a atualizar.
 * @param status Novo estado do report.
 * @returns O report atualizado.
*/  
export const updateReportStatus = async (id_report: number, status: string) => {
  return prisma.report.update({
    where: { id_report },
    data: {
      status,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Remove um report pelo ID do sistema.
 * @param id_report ID do report a remover.
 * @returns O report removido.
*/
export const deleteReport = async (id_report: number) => {
  return prisma.report.delete({
    where: { id_report },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Suspende o utilizador reportado e marca o report como resolvido.
 * @param id_report ID do report a processar.
 * @returns O report atualizado com status 'RESOLVIDO'.
 * Error se o report não existir.
*/
export const suspendReportedUser = async (id_report: number) => {
  const report = await prisma.report.findUnique({
    where: { id_report },
  });

  if (!report) {
    throw new Error('Report não existe');
  }

  await prisma.utilizador.update({
    where: {
      id_utilizador: report.id_reportado,
    },
    data: {
      suspenso: true,
    },
  });

  return prisma.report.update({
    where: { id_report },
    data: {
      status: 'RESOLVIDO',
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/** 
 * Remove a tarefa associada ao report e marca o report como resolvido.
 * @param id_report ID do report a processar.
 * @returns O report atualizado com status 'RESOLVIDO'.
 * Error se o report não existir ou não tiver tarefa associada.
*/
export const deleteReportedTask = async (id_report: number) => {
  const report = await getReportById(id_report);

  if (!report || !report.id_tarefa) {
    throw new Error('Este report não tem tarefa associada');
  }

  await prisma.task.delete({
    where: {
      id: report.id_tarefa,
    },
  });

  return updateReportStatus(id_report, 'RESOLVIDO');
};

