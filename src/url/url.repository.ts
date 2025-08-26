import { Repository, DataSource } from 'typeorm';
import { Url } from './url.entity';

export class UrlRepository {
  private dataSource: DataSource;
  private urlRepo: Repository<Url>;

  constructor() {}

  async connect() {
    if (this.urlRepo) return;
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Url],
      synchronize: true,
    });

    this.dataSource
      .initialize()
      .then(() => {
        console.log('✅ DataSource initialized');
        this.urlRepo = this.dataSource.getRepository(Url);
      })
      .catch((err) => {
        console.error('❌ Error during DataSource initialization:', err);
      });
  }

  async disconnect() {
    await this.dataSource.destroy();
  }

  async findByUrl(url: string): Promise<Url | null> {
    return this.urlRepo.findOne({ where: { originalUrl: url } });
  }

  async findByCode(code: string): Promise<Url | null> {
    return this.urlRepo.findOne({ where: { shortCode: code } });
  }

  async create(url: string, code: string): Promise<Url> {
    return this.urlRepo.save({ originalUrl: url, shortCode: code });
  }
}
