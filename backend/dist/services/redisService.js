"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class RedisService {
    constructor() {
        this.isConnected = false;
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'redis',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || 'secure_redis_password_2024',
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            connectTimeout: 10000,
            commandTimeout: 5000,
            enableAutoPipelining: true,
        });
        this.setupEventListeners();
        this.connect();
    }
    setupEventListeners() {
        this.client.on('connect', () => {
            console.log('✅ Redis connected successfully');
            this.isConnected = true;
        });
        this.client.on('ready', () => {
            console.log('✅ Redis is ready to receive commands');
        });
        this.client.on('error', (error) => {
            console.error('❌ Redis connection error:', error);
            this.isConnected = false;
        });
        this.client.on('close', () => {
            console.log('⚠️ Redis connection closed');
            this.isConnected = false;
        });
        this.client.on('reconnecting', () => {
            console.log('🔄 Redis reconnecting...');
        });
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
        }
    }
    // Session Management
    async setSession(sessionId, data, ttlSeconds = 3600) {
        try {
            await this.client.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
        }
        catch (error) {
            console.error('Error setting session:', error);
            throw error;
        }
    }
    async getSession(sessionId) {
        try {
            const data = await this.client.get(`session:${sessionId}`);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }
    async deleteSession(sessionId) {
        try {
            await this.client.del(`session:${sessionId}`);
        }
        catch (error) {
            console.error('Error deleting session:', error);
        }
    }
    // Caching
    async set(key, value, ttlSeconds) {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serializedValue);
            }
            else {
                await this.client.set(key, serializedValue);
            }
        }
        catch (error) {
            console.error('Error setting cache:', error);
            throw error;
        }
    }
    async get(key) {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            console.error('Error deleting cache:', error);
        }
    }
    // Rate Limiting
    async incrementWithExpiry(key, ttlSeconds = 60) {
        try {
            const multi = this.client.multi();
            multi.incr(key);
            multi.expire(key, ttlSeconds);
            const results = await multi.exec();
            return results?.[0]?.[1] || 0;
        }
        catch (error) {
            console.error('Error with rate limiting:', error);
            throw error;
        }
    }
    // Room availability caching
    async cacheAvailableRooms(checkIn, checkOut, guests, rooms) {
        const cacheKey = `rooms:available:${checkIn}:${checkOut}:${guests}`;
        await this.set(cacheKey, rooms, 300); // Cache for 5 minutes
    }
    async getCachedAvailableRooms(checkIn, checkOut, guests) {
        const cacheKey = `rooms:available:${checkIn}:${checkOut}:${guests}`;
        return await this.get(cacheKey);
    }
    // Reservation locks (prevent double bookings)
    async acquireReservationLock(roomId, checkIn, checkOut, ttlSeconds = 300) {
        try {
            const lockKey = `lock:reservation:${roomId}:${checkIn}:${checkOut}`;
            const result = await this.client.set(lockKey, 'locked', 'PX', ttlSeconds * 1000, 'NX');
            return result === 'OK';
        }
        catch (error) {
            console.error('Error acquiring reservation lock:', error);
            return false;
        }
    }
    async releaseReservationLock(roomId, checkIn, checkOut) {
        try {
            const lockKey = `lock:reservation:${roomId}:${checkIn}:${checkOut}`;
            await this.client.del(lockKey);
        }
        catch (error) {
            console.error('Error releasing reservation lock:', error);
        }
    }
    // Health Check
    async ping() {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            console.error('Redis ping failed:', error);
            return false;
        }
    }
    // Graceful shutdown
    async disconnect() {
        try {
            await this.client.quit();
            console.log('✅ Redis disconnected gracefully');
        }
        catch (error) {
            console.error('Error disconnecting from Redis:', error);
        }
    }
    // Get connection status
    isConnectedToRedis() {
        return this.isConnected;
    }
    // Get Redis client (for advanced operations)
    getClient() {
        return this.client;
    }
}
exports.redisService = new RedisService();
exports.default = exports.redisService;
//# sourceMappingURL=redisService.js.map