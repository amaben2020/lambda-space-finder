// import * as cdk from '@aws-cdk/core';
// import * as s3 from '@aws-cdk/aws-s3';
// import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
// import * as route53 from '@aws-cdk/aws-route53';

// export class AwsCdkS3Stack extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // Create the public S3 bucket
//     const publicAssets = new s3.Bucket(this, 'example-qr', {
//       bucketName: 'example.url2qr.me',
//       publicReadAccess: true,
//       removalPolicy: cdk.RemovalPolicy.DESTROY,
//       websiteIndexDocument: 'index.html',
//     });

//     // Deploy static code/files into Bucket.
//     const deployment = new s3Deployment.BucketDeployment(
//       this,
//       'deployStaticWebsite',
//       {
//         sources: [s3Deployment.Source.asset('./program/static')],
//         destinationBucket: publicAssets,
//       }
//     );

//     //Lookup the zone based on domain name
//     const zone = route53.HostedZone.fromLookup(this, 'baseZone', {
//       domainName: 'url2qr.me',
//     });

//     // Add the Subdomain to Route53 as a CNAM, with an aliase to the s3 bucket
//     const cName = new route53.CnameRecord(this, 'test.baseZone', {
//       zone: zone,
//       recordName: 'example',
//       domainName: publicAssets.bucketWebsiteDomainName,
//     });
//   }
// }
