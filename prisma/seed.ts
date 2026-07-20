import {
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
  FeedTipo,
} from '@prisma/client';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // =====================================================
  // PASSWORD HASH
  // =====================================================

  const passwordHash = await bcrypt.hash('123456', 10);


  // =====================================================
  // LIMPAR BASE DE DADOS
  // =====================================================

  await prisma.feedComentario.deleteMany();
  await prisma.feedLike.deleteMany();
  await prisma.feedPublicacao.deleteMany();

  await prisma.seguidor.deleteMany();

  await prisma.mergeFicheiro.deleteMany();
  await prisma.conflitoFicheiros.deleteMany();
  await prisma.ficheiroSubmetido.deleteMany();

  await prisma.report.deleteMany();

  await prisma.desafioParticipacao.deleteMany();
  await prisma.desafio.deleteMany();

  await prisma.notificacao.deleteMany();

  await prisma.subTask.deleteMany();
  await prisma.task.deleteMany();

  await prisma.utilizadorGrupo.deleteMany();
  await prisma.grupo.deleteMany();

  await prisma.utilizador.deleteMany();


  // =====================================================
  // USERS
  // =====================================================

  const admin = await prisma.utilizador.create({
    data: {
      nome: 'Ana Admin',
      email: 'admin@taskly.pt',
      handle: 'ana_admin',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const joao = await prisma.utilizador.create({
    data: {
      nome: 'João Silva',
      email: 'joao@taskly.pt',
      handle: 'joao_dev',
      password: passwordHash,
      role: Role.USER,
    },
  });

  const maria = await prisma.utilizador.create({
    data: {
      nome: 'Maria Costa',
      email: 'maria@taskly.pt',
      handle: 'maria_ui',
      password: passwordHash,
      role: Role.USER,
    },
  });

  const pedro = await prisma.utilizador.create({
    data: {
      nome: 'Pedro Rocha',
      email: 'pedro@taskly.pt',
      handle: 'pedro_backend',
      password: passwordHash,
      role: Role.USER,
    },
  });

  const carla = await prisma.utilizador.create({
    data: {
      nome: 'Carla Ferreira',
      email: 'carla@taskly.pt',
      handle: 'carla_mobile',
      password: passwordHash,
      role: Role.USER,
    },
  });


  // =====================================================
  // GRUPOS
  // =====================================================

  const grupo1 = await prisma.grupo.create({
    data: {
      nome: 'Equipa ASW',
    },
  });

  const grupo2 = await prisma.grupo.create({
    data: {
      nome: 'Frontend Ninjas',
    },
  });


  // =====================================================
  // USERS NOS GRUPOS
  // =====================================================

  await prisma.utilizadorGrupo.createMany({
    data: [
      {
        gr_id: grupo1.grupo_id,
        ut_id: admin.id_utilizador,
        classe: 'LIDER',
      },
      {
        gr_id: grupo1.grupo_id,
        ut_id: joao.id_utilizador,
        classe: 'MEMBRO',
      },
      {
        gr_id: grupo1.grupo_id,
        ut_id: maria.id_utilizador,
        classe: 'MEMBRO',
      },
      {
        gr_id: grupo2.grupo_id,
        ut_id: carla.id_utilizador,
        classe: 'LIDER',
      },
      {
        gr_id: grupo2.grupo_id,
        ut_id: pedro.id_utilizador,
        classe: 'MEMBRO',
      },
    ],
  });


  // =====================================================
  // TASKS
  // =====================================================

  const task1 = await prisma.task.create({
    data: {
      title: 'Implementar backend',
      description: 'Criar endpoints REST da aplicação',
      priority: TaskPriority.ALTA,
      status: TaskStatus.DOING,
      dueDate: new Date('2026-05-20'),
      id_user: joao.id_utilizador,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Criar interface React',
      description: 'Desenvolver páginas principais',
      priority: TaskPriority.MEDIA,
      status: TaskStatus.PENDING,
      dueDate: new Date('2026-05-25'),
      id_user: maria.id_utilizador,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Sistema de autenticação',
      description: 'JWT + middleware authGuard',
      priority: TaskPriority.URGENTE,
      status: TaskStatus.DONE,
      dueDate: new Date('2026-05-10'),
      id_user: pedro.id_utilizador,
    },
  });


  // =====================================================
  // SUBTASKS
  // =====================================================

  const sub1 = await prisma.subTask.create({
    data: {
      id_tarefa: task1.id,
      titulo: 'Criar routes',
      concluida: true,
    },
  });

  const sub2 = await prisma.subTask.create({
    data: {
      id_tarefa: task1.id,
      titulo: 'Criar controllers',
      concluida: false,
    },
  });

  const sub3 = await prisma.subTask.create({
    data: {
      id_tarefa: task2.id,
      titulo: 'Página login',
      concluida: true,
    },
  });


  // =====================================================
  // NOTIFICAÇÕES
  // =====================================================

await prisma.notificacao.createMany({
  data: [
    {
      id_target: joao.id_utilizador,
      mensagem: "A tarefa backend termina amanhã.",
      lida: false,
    },
    {
      id_target: maria.id_utilizador,
      mensagem: "Foste adicionada ao grupo Equipa ASW.",
      lida: true,
    },
  ],
});


  // =====================================================
  // REPORTS
  // =====================================================

  await prisma.report.create({
    data: {
      id_reportado_por: maria.id_utilizador,
      id_reportado: joao.id_utilizador,
      id_tarefa: task1.id,
      tipo: 'spam',
      status: 'PENDENTE',
      relevancia: 'ALTA',
    },
  });


  // =====================================================
  // FOLLOWERS
  // =====================================================

  await prisma.seguidor.createMany({
    data: [
      {
        seguido_id: joao.id_utilizador,
        seguidor_id: maria.id_utilizador,
      },
      {
        seguido_id: joao.id_utilizador,
        seguidor_id: carla.id_utilizador,
      },
      {
        seguido_id: maria.id_utilizador,
        seguidor_id: pedro.id_utilizador,
      },
    ],
  });


  // =====================================================
  // FEED POSTS
  // =====================================================

  const post1 = await prisma.feedPublicacao.create({
    data: {
      id_user: joao.id_utilizador,
      id_tarefa: task1.id,
      tipo: FeedTipo.TAREFA_EM_PROGRESSO,
      comentario: 'Backend quase terminado 🚀',
      quer_participantes: false,
    },
  });

  const post2 = await prisma.feedPublicacao.create({
    data: {
      id_user: maria.id_utilizador,
      id_subtask: sub3.id_subtask,
      tipo: FeedTipo.SUBTAREFA_CONCLUIDA,
      comentario: 'Página login concluída ✅',
    },
  });



  // =====================================================
  // LIKES
  // =====================================================

  await prisma.feedLike.createMany({
    data: [
      {
        id_publicacao: post1.id_publicacao,
        id_user: maria.id_utilizador,
      },
      {
        id_publicacao: post1.id_publicacao,
        id_user: carla.id_utilizador,
      },
      {
        id_publicacao: post2.id_publicacao,
        id_user: joao.id_utilizador,
      },
    ],
  });

}

main()
  .then(() => {
    console.log("Seed concluída com sucesso!");
  })
  .catch((e) => {
    console.error("Erro na seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });