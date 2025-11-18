import AWS from 'aws-sdk';
import logger from '../utils/logger.js';

let s3Client = null;

const initializeS3 = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    logger.warn('AWS credentials not configured. S3 features will be disabled.');
    return null;
  }

  s3Client = new AWS.S3({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  logger.info('AWS S3 client initialized');
  return s3Client;
};

export const uploadToS3 = async (fileBuffer, key, contentType) => {
  if (!s3Client) {
    throw new Error('S3 client not initialized');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  return s3Client.upload(params).promise();
};

export const getFromS3 = async (key) => {
  if (!s3Client) {
    throw new Error('S3 client not initialized');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  return s3Client.getObject(params).promise();
};

export const deleteFromS3 = async (key) => {
  if (!s3Client) {
    throw new Error('S3 client not initialized');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  return s3Client.deleteObject(params).promise();
};

export default initializeS3;
