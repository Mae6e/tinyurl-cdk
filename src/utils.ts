type Response = { body: string; statusCode: number };

const NotFoundResponse = (path: string): Response => {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: `not found ${path}` }),
  };
};
const ErrorResponse = (error: Error): Response => {
  return {
    statusCode: 500,
    body: JSON.stringify({ message: error.message }),
  };
};

const CreateResponse = (data): Response => {
  return {
    statusCode: 201,
    body: JSON.stringify({
      data,
    }),
  };
};

const GetResponse = (data): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data,
    }),
  };
};

export {
  Response,
  CreateResponse,
  GetResponse,
  ErrorResponse,
  NotFoundResponse,
};
