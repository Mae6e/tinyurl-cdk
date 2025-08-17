import { Repository, DataSource } from 'typeorm';
import { Url } from './url.entity';
import { createClient, RedisClientType } from 'redis';

export class UrlRepository {
  private dataSource: DataSource;
  private urlRepo: Repository<Url>;
  private redisClient: RedisClientType;
  private isInitialized = false;

  constructor() {
    // Don't initialize here anymore
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Database connection
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Url],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    });

    await this.dataSource.initialize();
    this.urlRepo = this.dataSource.getRepository(Url);

    const redisUrl = `${process.env.REDIS_HOST}`;

    // Redis connection
    this.redisClient = createClient({
      url: redisUrl,
    });
    
    this.redisClient.on('error', console.error);
    await this.redisClient.connect();

    this.isInitialized = true;
  }

  // ... rest of the methods ...


  // Data access methods
  async findByUrl(url: string): Promise<Url | null> {
    return this.urlRepo.findOne({ where: { originalUrl: url } });
  }

  async findByCode(code: string): Promise<Url | null> {
    return this.urlRepo.findOne({ where: { shortCode: code } });
  }

  async create(url: string, code: string): Promise<Url> {
    return this.urlRepo.save({ originalUrl: url, shortCode: code });
  }

  async getFromCache(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setToCache(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async disconnect() {
    await this.redisClient.quit();
    await this.dataSource.destroy();
  }
}



