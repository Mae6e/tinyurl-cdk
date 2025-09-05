import { createClient, RedisClientType } from 'redis';

export class UrlCache {
  private redisClient: RedisClientType;

  async connect() {
    if (this.redisClient) return;

    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    this.redisClient.on('error', console.error);

    await this.redisClient.connect();
    console.log('✅ Cache initialized');
  }

  async disconnect() {
    await this.redisClient.quit();
  }

  async getFromCache(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setToCache(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }
}
