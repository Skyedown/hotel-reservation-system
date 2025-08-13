import Redis from 'ioredis';
declare class RedisService {
    private client;
    private isConnected;
    constructor();
    private setupEventListeners;
    private connect;
    setSession(sessionId: string, data: any, ttlSeconds?: number): Promise<void>;
    getSession(sessionId: string): Promise<any | null>;
    deleteSession(sessionId: string): Promise<void>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<any | null>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<boolean>;
    ttl(key: string): Promise<number>;
    pipeline(): import("ioredis").ChainableCommander;
    incrementWithExpiry(key: string, ttlSeconds?: number): Promise<number>;
    cacheAvailableRooms(checkIn: string, checkOut: string, guests: number, rooms: any[]): Promise<void>;
    getCachedAvailableRooms(checkIn: string, checkOut: string, guests: number): Promise<any[] | null>;
    acquireReservationLock(roomId: string, checkIn: string, checkOut: string, ttlSeconds?: number): Promise<boolean>;
    releaseReservationLock(roomId: string, checkIn: string, checkOut: string): Promise<void>;
    ping(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnectedToRedis(): boolean;
    getClient(): Redis;
}
export declare const redisService: RedisService;
export default redisService;
//# sourceMappingURL=redisService.d.ts.map