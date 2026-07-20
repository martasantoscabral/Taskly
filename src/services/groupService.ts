import { prisma } from "../lib/prisma.js"



export const createGroup = async (nome: string) => {
    return prisma.grupo.create({data:{nome}})
};

export const createGroupUtilizador = async (gr_id: number, ut_id:number, classe: "MEMBRO" | "LIDER") => {
    return prisma.utilizadorGrupo.create({
        data:{gr_id,
              ut_id,
              classe,
            }});
};

export const getGroupsByUser = async (ut_id: number) => {
  return prisma.utilizadorGrupo.findMany({
    where: {
      ut_id,
    },
    include: {
      grupo: true,
    },
  });
};


export const deleteUtilizadorGrupo = async (gr_id:number, ut_id:number) => {
    return prisma.utilizadorGrupo.delete({
        where: {gr_id_ut_id:{
                    gr_id,
                    ut_id,},
                }
    })
};

export const deleteGroup = async (grupo_id: number) => {
    return prisma.grupo.delete({where: {grupo_id},});
};
    
export const getAllUserInGroup = async (grupo_id: number) => {
  return prisma.utilizadorGrupo.findMany({where: {gr_id: grupo_id,}, include: {utilizador: true,},
  });
};



