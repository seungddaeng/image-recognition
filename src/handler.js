const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.getSignedUrl = async (event) => {
  const { filename, filetype } = event.queryStringParameters;
  const key = `uploads/${Date.now()}-${filename}`;

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: 60, // tiempo en segundos
    ContentType: filetype,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadURL, key }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};