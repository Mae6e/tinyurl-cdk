import * as crc32 from 'crc-32';
import { UrlRepository } from './url.repository';
import { UrlCache } from './url.cache';

export class UrlService {
  private urlRepository: UrlRepository = new UrlRepository();
  private urlCache: UrlCache = new UrlCache();

  constructor() {
    this.urlRepository.connect();
    this.urlCache.connect();
  }

  async shorten(url: string): Promise<string> {
    if (!this.isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    //Check cache first
    const cachedCode = await this.urlCache.getFromCache(`url:${url}`);
    if (cachedCode) return cachedCode;

    // Generate new short code
    const shortCode = this.generateShortCode(url);

    // Save to DB
    await this.urlRepository.create(url, shortCode);

    // Cache the result
    await this.cacheUrl(url, shortCode);

    return shortCode;
  }

  async resolve(code: string): Promise<string> {
    // Check cache first
    const cachedUrl = await this.urlCache.getFromCache(`code:${code}`);
    if (cachedUrl) return cachedUrl;

    // Fetch from DB
    const urlEntity = await this.urlRepository.findByCode(code);
    if (!urlEntity) throw new Error('URL not found');

    // Cache the result
    await this.cacheUrl(urlEntity.originalUrl, urlEntity.shortCode);

    return urlEntity.originalUrl;
  }

  private async cacheUrl(url: string, code: string): Promise<void> {
    await Promise.all([
      this.urlCache.setToCache(`url:${url}`, code),
      this.urlCache.setToCache(`code:${code}`, url),
    ]);
  }

  private generateShortCode(url: string): string {
    const hash = crc32.buf(Buffer.from(url));
    return Math.abs(hash).toString(16).slice(0, 7);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
