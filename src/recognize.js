const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.processImage = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  const params = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MaxLabels: 10,
    MinConfidence: 75,
  };

  const result = await rekognition.detectLabels(params).promise();

  await dynamo.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      image: key,
      labels: result.Labels.map(label => ({
        Name: label.Name,
        Confidence: label.Confidence,
      })),
      timestamp: Date.now(),
    },
  }).promise();

  return { statusCode: 200, body: 'Image processed successfully.' };
};
