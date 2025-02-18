// import { S3Event } from 'aws-lambda';
// import * as AWS from 'aws-sdk';

// export const handler = async (
//   event: S3Event,
//   context: any = {}
// ): Promise<any> => {
//   const bucketName = process.env.bucketName || '';
//   console.log(bucketName);
//   const objectKey = 'input-file.txt';

//   const s3 = new AWS.S3();
//   const params = { Bucket: bucketName, Key: objectKey };
//   const response = await s3.getObject(params).promise();
//   const data = response.Body?.toString('utf-8') || '';

//   console.log('file contents:', data);

//   for (const record of event.Records) {
//     const bucketName = record?.s3?.bucket?.name || '';
//     const objectKey = record?.s3?.object?.key || '';

//     const s3 = new AWS.S3();
//     const params = { Bucket: bucketName, Key: objectKey };
//     const response = await s3.getObject(params).promise();
//     const data = response.Body?.toString('utf-8') || '';
//     console.log('file contents:', data);
//   }
// };

import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { format, parse } from 'date-fns';

export const handler = async (
  event: S3Event,
  context: any = {}
): Promise<any> => {
  for (const record of event.Records) {
    const bucketName = record?.s3?.bucket?.name || '';
    const objectKey = record?.s3?.object?.key || '';

    //Take only the date part
    const salesDateInStr = objectKey.replace(`sales/`, '').substring(0, 10);
    //Parse the date so that it can be used later
    const salesDate = parse(salesDateInStr, 'MM/dd/yyyy', new Date());

    const s3 = new AWS.S3();
    const params = { Bucket: bucketName, Key: objectKey };
    const response = await s3.getObject(params).promise();
    const data = response.Body?.toString('utf-8') || '';
    console.log(`sales on ${salesDate.toISOString()} :`, data);
  }
};
