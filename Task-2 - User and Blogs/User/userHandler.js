'use strict';
const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const {auth} = require('../Authorization/auth')

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider()


const signupUser = async (event) => {
  try {
    const { email, password } = event.arguments;
    if(password.length < 6 ) {
      return {
        message: "Password must be at least 6 characters"
      }
    }
    const { user_pool_id } = process.env;
    const params = {
      UserPoolId: user_pool_id,
      Username: email,
      UserAttributes: [
          {
              Name: 'email',
              Value: email
          },
          {
              Name: 'email_verified',
              Value: 'true'
          }],
      MessageAction: 'SUPPRESS'
    }
    const response = await cognito.adminCreateUser(params).promise();
    if (response.User) {
      const paramsForSetPass = {
          Password: password,
          UserPoolId: user_pool_id,
          Username: email,
          Permanent: true
      };
      await cognito.adminSetUserPassword(paramsForSetPass).promise()
    }
    return {
      message: "User created"
    }
    
  } catch (error) {
    return {
      message : error.message
    }
  }
}

const signinUser = async (event) => {
  try {
    const { email, password } = event.arguments;
    const { user_pool_id, client_id } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: user_pool_id,
      ClientId: client_id,
      AuthParameters: {
          USERNAME: email,
          PASSWORD: password
      }
    }
    const response = await cognito.adminInitiateAuth(params).promise();
    return {
      message: "User signed in",
      token: response.AuthenticationResult.IdToken
    }
    
  } catch (error) {
    return {
      message : error.message
    }
  }
}


const createUser = async (event) => {
  try {
    const authToken = event.request.headers.authorization.split(' ')[1];
    if(auth(authToken)) {
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
    }
  } catch (error) {
    console.log(error);
    return {
      message : error.message
    }
  }
};

const updateUser = async (event) => {
  try {
    const authToken = event.request.headers.authorization.split(' ')[1];
    if(auth(authToken)){
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
    }
    
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const deleteUser = async (event) => {
  try {
    const authToken = event.request.headers.authorization.split(' ')[1];
    if(auth(authToken)){
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
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

const getUser = async (event) => {
  try {
    const authToken = event.request.headers.authorization.split(' ')[1];
    if(auth(authToken)){
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
    }
  } catch (error) {
      return {
        message: error.message
      }
  }
}

module.exports = {
  signupUser,
  signinUser,
  createUser,
  updateUser,
  deleteUser,
  getUser
}