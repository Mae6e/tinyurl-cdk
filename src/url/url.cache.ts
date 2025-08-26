import { createClient, RedisClientType } from 'redis';

export class UrlCache {
  private redisClient: RedisClientType;

  connect() {
    if (this.redisClient) return;

    this.redisClient = createClient({
      url: `${process.env.REDIS_HOST}`,
    });
    this.redisClient.on('error', console.error);

    this.redisClient
      .connect()
      .then(() => {
        console.log('✅ Cache initialized');
      })
      .catch((err) => {
        console.error('❌ Error during Cache initialization:', err);
      });
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
