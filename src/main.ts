import { Handler } from 'aws-lambda';
import * as dotenv from 'dotenv';
import { UrlService } from './url/url.service';
import {
  Response,
  CreateResponse,
  GetResponse,
  NotFoundResponse,
  ErrorResponse,
} from './utils';

dotenv.config();
const urlService = new UrlService();

export const handler: Handler = async (event): Promise<Response> => {
  try {
    const body = JSON.parse(event.body);
    const path: string = event.path;
    const method = event.httpMethod;
    const code = event.pathParameters?.code;

    console.error('path:', path);
    console.error('body:', body);
    console.error('method:', method);
    console.error('code:', code);

    if (path.indexOf('/shorten') !== -1 && method === 'POST') {
      const response = await urlService.shorten(body.originalUrl);
      return CreateResponse(response);
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
