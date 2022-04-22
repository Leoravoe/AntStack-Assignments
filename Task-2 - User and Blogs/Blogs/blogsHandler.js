'use strict';
const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const createBlog = async (event) => {
  try {
    const id = uuid.v4();
    const params = {
      TableName: process.env.BlogsTable,
      Item :{
        id,
        ...event.arguments
      }
    };
    const blog = await dynamoDb.put(params).promise();
    
    return {
          id,
          ...event.arguments
        }
  } catch (error) {
    return {
      message : error.message
    }
  }
};

const updateBlog = async (event) => {
  try {
      const {id,userId, title, content, visibility} = event.arguments
      var params = {
        TableName : process.env.BlogsTable,
        Key: { 
            id,
            userId 
        },
        UpdateExpression : 'set #a = :title, #b = :content, #c = :visibility',
        ExpressionAttributeNames: { '#a' : 'title', '#b': 'content', '#c' : 'visibility' },
        ExpressionAttributeValues : { ':title' : title, ':content': content, ':visibility' : visibility},
      };
      const blogUpdate = await dynamoDb.update(params).promise();
      return {
        ...event.arguments
    }
  } catch (error) {
      console.log(error)
      return {
        message: error.message
      }
  }
}

const deleteBlog = async (event) => {
  try {
      const {id , userId} = event.arguments
    const params = {
      TableName: process.env.BlogsTable,
      Key: {
        id,
        userId
      },
    };
    const blogDelete = await dynamoDb.delete(params).promise();
    return {
      id : event.arguments.id
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const getBlogById = async (event) => {
  try {
    const {id , userId} = event.arguments
    const params = {
      TableName: process.env.BlogsTable,
      Key: {
        id,
        userId
      },
    };

    const blog = await dynamoDb.get(params).promise();
    return {
      ...blog.Item
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const getBlogs = async (event) => {
  try {
    const {id,userId} = event.arguments
    const params = {
        TableName: process.env.BlogsTable,
        KeyConditionExpression: 'id = :id AND userId = :userId',
        ExpressionAttributeValues: {
            ':id': id,
            ':userId': userId
        }
    };

    const blog = await dynamoDb.query(params).promise();
    return blog.Items
  } catch (error) {
      return {
        message: error.message
      }
  }
}

module.exports = {
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    getBlogs
}