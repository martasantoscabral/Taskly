import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

export const getUsers = async () => {
  return prisma.utilizador.findMany({
    select: {
      id_utilizador: true,
      nome: true,
      email: true,
      handle: true,
      suspenso: true,
      criadoEM: true,
      role: true,
    },
  });
};


export const createUser = async (
  nome: string,
  email: string,
  handle: string,
  password: string,
  role: 'USER' | 'ADMIN' = 'USER'
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.utilizador.create({
    data: {
      nome,
      email,
      handle,
      password: hashedPassword,
      role,
    },
  });
};

export const getUserById = async (id_utilizador: number) => {
  return prisma.utilizador.findUnique({
    where: { id_utilizador },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.utilizador.findUnique({
    where: { email },
  });
};

export const updateUser = async (
  id_utilizador: number,
  dados: {
    nome?: string;
    email?: string;
    handle?: string;
    password?: string;
    suspenso?: boolean;
    role?: 'USER' | 'ADMIN';
  }
) => {
  return prisma.utilizador.update({
    where: { id_utilizador },
    data: dados,
  });
};

export const deleteUser = async (id_utilizador: number) => {
  return prisma.utilizador.delete({
    where: { id_utilizador },
  });
};