import { Request, Response } from 'express';
import { prisma } from './config/prisma';
import jwt from 'jsonwebtoken';
import { Admin } from '@prisma/client';

export interface Context {
  prisma: typeof prisma;
  admin?: Admin | null;
  req: Request;
  res: Response;
}

export async function createContext(contextValue: any): Promise<Context> {
  const { req, res } = contextValue;
  let admin: Admin | null = null;

  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { adminId: string };
      admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId }
      });
    } catch (error) {
      console.warn('Invalid token:', error);
    }
  }

  return {
    prisma,
    admin,
    req,
    res,
  };
}