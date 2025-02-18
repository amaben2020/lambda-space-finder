import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

export const handler = async (
  event: S3Event,
  context: any = {}
): Promise<any> => {
  const bucketName = process.env.bucketName || '';
  const objectKey = 'output-file.txt';

  const s3 = new AWS.S3();
  const params: PutObjectRequest = {
    Bucket: bucketName,
    Key: objectKey,
    Body: 'Contents from Lambda',
  };
  await s3.putObject(params).promise();
  console.log('file is written successfully');
};

// import { S3Event } from 'aws-lambda';
// import { promises as fsPromises } from 'fs';
// import * as AWS from 'aws-sdk';
// import { PutObjectRequest } from 'aws-sdk/clients/s3';

// export const handler = async (
//   event: S3Event,
//   context: any = {}
// ): Promise<any> => {
//   const bucketName = process.env.bucketName || '';
//   const objectKey = 'output-file.txt';
//   // writing to temp file
//   const filePath = `/tmp/${objectKey}`;

//   await fsPromises.writeFile(filePath, 'Contents from Lambda to local file');
//   const fileContents = await fsPromises.readFile(filePath);

//   const s3 = new AWS.S3();
//   const params: PutObjectRequest = {
//     Bucket: bucketName,
//     Key: objectKey,
//     Body: fileContents,
//   };
//   await s3.upload(params).promise();
//   console.log('file is uploaded successfully');
// };
