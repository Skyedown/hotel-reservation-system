"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const prisma_1 = require("./config/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function createContext(contextValue) {
    const { req, res } = contextValue;
    let admin = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            admin = await prisma_1.prisma.admin.findUnique({
                where: { id: decoded.adminId }
            });
        }
        catch (error) {
            console.warn('Invalid token:', error);
        }
    }
    return {
        prisma: prisma_1.prisma,
        admin,
        req,
        res,
    };
}
//# sourceMappingURL=context.js.map