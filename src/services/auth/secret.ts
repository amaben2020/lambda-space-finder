const handler = async (): Promise<{
  statusCode: number;
  body: string;
}> => {
  return Promise.resolve({
    statusCode: 200,
    body: 'CAUTION !!! THIS IS VERY SECRET',
  });
};

export { handler };

// Note: Ensure that POSTMAN authorization is set to No Auth, Headers ===> Authorization Bearer <token>
