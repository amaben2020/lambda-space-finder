// import { S3 } from 'aws-sdk';

// const s3 = new S3();
// const bucketName = process.env.BUCKET_NAME!;

// export const handler = async (event: any) => {
//   const { operation, fileName, fileContent, contentType } = JSON.parse(
//     event.body || '{}'
//   );

//   try {
//     switch (operation) {
//       case 'UPLOAD': {
//         if (!fileName || !fileContent || !contentType) {
//           return { statusCode: 400, body: 'Missing required fields' };
//         }

//         // Convert Base64 to Buffer for binary files (PDFs, images)
//         const fileBuffer = Buffer.from(fileContent, 'base64');

//         const params = {
//           Bucket: bucketName,
//           Key: fileName,
//           Body: fileBuffer,
//           ContentType: contentType, // Ensure correct content type
//         };

//         await s3.putObject(params).promise();
//         return {
//           statusCode: 200,
//           body: `File '${fileName}' uploaded successfully.`,
//         };
//       }

//       case 'READ': {
//         const params = { Bucket: bucketName, Key: fileName };
//         const response = await s3.getObject(params).promise();

//         return {
//           statusCode: 200,
//           headers: {
//             'Content-Type': response.ContentType || 'application/octet-stream',
//           },
//           body: response.Body?.toString('base64'), // Send back as Base64
//           isBase64Encoded: true, // Required for binary data
//         };
//       }

//       case 'DELETE': {
//         const params = { Bucket: bucketName, Key: fileName };
//         await s3.deleteObject(params).promise();
//         return { statusCode: 200, body: `File '${fileName}' deleted.` };
//       }

//       default:
//         return { statusCode: 400, body: 'Invalid operation' };
//     }
//   } catch (error) {
//     console.error(error);
//     return { statusCode: 500, body: 'Error processing request' };
//   }
// };

import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.BUCKET_NAME!;

export const handler = async (event: APIGatewayEvent) => {
  console.log(event.httpMethod);

  const { operation, fileName, fileContent, contentType } = JSON.parse(
    event.body || '{}'
  );

  try {
    switch (operation) {
      case 'UPLOAD': {
        if (!fileName || !fileContent || !contentType) {
          return { statusCode: 400, body: 'Missing required fields' };
        }

        // Convert Base64 to Buffer for binary files (PDFs, images)
        const fileBuffer = Buffer.from(fileContent, 'base64');

        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: fileBuffer,
          ContentType: contentType, // Ensure correct content type
        };

        await s3.putObject(params).promise();
        return {
          statusCode: 200,
          body: `File '${fileName}' uploaded successfully.`,
        };
      }

      case 'READ': {
        const params = { Bucket: bucketName, Key: fileName };
        const response = await s3.getObject(params).promise();

        return {
          statusCode: 200,
          headers: {
            'Content-Type': response.ContentType || 'application/octet-stream',
          },
          body: response.Body?.toString('base64'), // Send back as Base64
          isBase64Encoded: true, // Required for binary data
        };
      }

      case 'DELETE': {
        const params = { Bucket: bucketName, Key: fileName };
        await s3.deleteObject(params).promise();
        return { statusCode: 200, body: `File '${fileName}' deleted.` };
      }

      default:
        return { statusCode: 400, body: 'Invalid operation' };
    }
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Error processing request' };
  }
};
