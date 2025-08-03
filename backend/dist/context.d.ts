import { Request, Response } from 'express';
import { prisma } from './config/prisma';
import { Admin } from '@prisma/client';
export interface Context {
    prisma: typeof prisma;
    admin?: Admin | null;
    req: Request;
    res: Response;
}
export declare function createContext(contextValue: any): Promise<Context>;
//# sourceMappingURL=context.d.ts.map