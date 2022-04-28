'use strict';

const formParser = require('lambda-multipart-parser');
const uuid = require('node-uuid');
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const uploadFile = async (event) => {
  const result = await formParser.parse(event);
  const id = uuid.v4()
  try {
    const url = await s3.putObject({
      Bucket: process.env.BUCKET_NAME,
      Key: `${id}-${result.files[0].filename}`,
      Body: result.files[0].content,
      ACL : 'public-read'
      // Tagging: queryString.encode(tags),
    }).promise();
    // const url = await s3.getSignedUrl('putObject',{
    //   Bucket: process.env.BUCKET_NAME,
    //   Key: result.files[0].filename,
    //   Body: result.files[0].content,
    //   // Tagging: queryString.encode(tags),
    // })

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'file saved',
        url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${id}-${result.files[0].filename}`
      })
    };

  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};



module.exports = {
  uploadFile
}