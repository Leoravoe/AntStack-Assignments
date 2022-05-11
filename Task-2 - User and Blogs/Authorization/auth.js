const jwt = require('jsonwebtoken')

module.exports.auth = (token) => {
  const tokenValidation = jwt.decode(token);
  return tokenValidation.email_verified;
}