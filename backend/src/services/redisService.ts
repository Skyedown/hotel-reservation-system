import Redis from 'ioredis';

class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || 'secure_redis_password_2024',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      // Security: Disable automatic reconnection after failures
      enableAutoPipelining: true,
      maxLoadingTimeout: 3000,
    });

    this.setupEventListeners();
    this.connect();
  }

  private setupEventListeners(): void {
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

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
    }
  }

  // Session Management
  async setSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.client.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const data = await this.client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // Caching
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Error setting cache:', error);
      throw error;
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
    }
  }

  // Rate Limiting
  async incrementWithExpiry(key: string, ttlSeconds: number = 60): Promise<number> {
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, ttlSeconds);
      const results = await multi.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      console.error('Error with rate limiting:', error);
      throw error;
    }
  }

  // Room availability caching
  async cacheAvailableRooms(checkIn: string, checkOut: string, guests: number, rooms: any[]): Promise<void> {
    const cacheKey = `rooms:available:${checkIn}:${checkOut}:${guests}`;
    await this.set(cacheKey, rooms, 300); // Cache for 5 minutes
  }

  async getCachedAvailableRooms(checkIn: string, checkOut: string, guests: number): Promise<any[] | null> {
    const cacheKey = `rooms:available:${checkIn}:${checkOut}:${guests}`;
    return await this.get(cacheKey);
  }

  // Reservation locks (prevent double bookings)
  async acquireReservationLock(roomId: string, checkIn: string, checkOut: string, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const lockKey = `lock:reservation:${roomId}:${checkIn}:${checkOut}`;
      const result = await this.client.set(lockKey, 'locked', 'PX', ttlSeconds * 1000, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error('Error acquiring reservation lock:', error);
      return false;
    }
  }

  async releaseReservationLock(roomId: string, checkIn: string, checkOut: string): Promise<void> {
    try {
      const lockKey = `lock:reservation:${roomId}:${checkIn}:${checkOut}`;
      await this.client.del(lockKey);
    } catch (error) {
      console.error('Error releasing reservation lock:', error);
    }
  }

  // Health Check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log('✅ Redis disconnected gracefully');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }

  // Get connection status
  isConnectedToRedis(): boolean {
    return this.isConnected;
  }

  // Get Redis client (for advanced operations)
  getClient(): Redis {
    return this.client;
  }
}

export const redisService = new RedisService();
export default redisService;