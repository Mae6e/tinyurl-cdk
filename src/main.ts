import { Handler } from 'aws-lambda';

import { UrlRepository } from './url/url.repository';
import { UrlService } from './url/url.service';

export const handler: Handler = async (event, context) => {
  console.log('jadddid jadid');

  const urlRepository = new UrlRepository();
  await urlRepository.initialize(); // Wait for initialization
  console.log('/urlRepository' , urlRepository);

  const urlService = new UrlService(urlRepository);

  console.log('/urlService' , urlService);

  try {
    // Example usage
    const testUrl = 'https://example.com';

    // Shorten URL
    const shortCode = await urlService.shorten(testUrl);
    console.log(`Shortened: ${shortCode}`);

    // Resolve URL
    const originalUrl = await urlService.resolve(shortCode);
    console.log(`Original: ${originalUrl}`);

    // Test cache
    console.log('Testing cache...');
    const cachedCode = await urlService.shorten(testUrl);
    console.log(`From cache: ${cachedCode}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await urlRepository.disconnect();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `it is ok` }),
  };
};
