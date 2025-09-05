import { Handler } from 'aws-lambda';
import { UrlService } from './url/url.service';
import {
  Response,
  CreateResponse,
  GetResponse,
  NotFoundResponse,
  ErrorResponse,
} from './utils';

const urlService = new UrlService();

export const handler: Handler = async (event): Promise<Response> => {
  try {
    const body = JSON.parse(event.body);
    const path: string = event.path;
    const method = event.httpMethod;
    const code = event.pathParameters?.code;
    const { domainName, stage } = event.requestContext;

    console.log('path:', path);
    console.log('body:', body);
    console.log('method:', method);
    console.log('code:', code);

    await urlService.init();

    if (path.indexOf('/shorten') !== -1 && method === 'POST') {
      const response = await urlService.shorten(body.originalUrl);
      return CreateResponse(`https://${domainName}/${stage}/${response}`);
    } else if (method === 'GET') {
      const response = await urlService.resolve(code);
      return GetResponse(response);
    } else {
      return NotFoundResponse(path);
    }
  } catch (err) {
    console.error('Error:', err);
    return ErrorResponse(err);
  }
};
