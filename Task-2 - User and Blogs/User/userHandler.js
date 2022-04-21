'use strict';
const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const createUser = async (event) => {
  try {
    const id = uuid.v4();
    const params = {
      TableName: process.env.UsersTable,
      Item :{
        id,
        ...event.arguments
      }
    };
    const user = await dynamoDb.put(params).promise();
    
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

const updateUser = async (event) => {
  try {
    const {id, name, age} = event.arguments
    var params = {
      TableName : process.env.UsersTable,
      Key: {id},
      UpdateExpression : 'set #a = :name, #b = :age',
      ExpressionAttributeNames: { '#a' : 'name', '#b': 'age' },
      ExpressionAttributeValues : { ':name' : name, ':age': age },
    };
    const userUpdate = await dynamoDb.update(params).promise();
    return {
      id,
      name,
      age
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const deleteUser = async (event) => {
  try {
    const params = {
      TableName: process.env.UsersTable,
      Key: {
        id: event.arguments.id,
      },
    };
    const userDelete = await dynamoDb.delete(params).promise();
    return {
      id : event.arguments.id
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const getUser = async (event) => {
  try {
    const params = {
      TableName: process.env.UsersTable,
      Key: {
        id: event.arguments.id,
      },
    };

    const user = await dynamoDb.get(params).promise();
    return {
      ...user.Item
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser
}