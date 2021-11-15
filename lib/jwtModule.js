const config = require('../config/index');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('./private.key', 'utf8'); // to sign JWT
const publicKey = fs.readFileSync('./public.key', 'utf8'); // to verify JWT
const TOKEN_EXPIRES_TIME = '7d'; // 7 Days Expire
module.exports = {
  sign: (payload, options) => {
    const signingOptions = {
      algorithm: 'RS256',
      audience: options.audience,
      expiresIn: TOKEN_EXPIRES_TIME,
      issuer: config.jwtIssuer,
      subject: options.subject
    };
    return jwt.sign(payload, privateKey, signingOptions);
  },

  parseTokenFromAuthorizationHeader: (req) => {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader || !authorizationHeader.includes('Bearer ')) {
      return null
    }
    return req.headers['authorization'].split(' ')[1]
  },

  verify: (token, options) => {
    const verifyOptions = {
      algorithm: ['RS256'],
      audience: options.audience,
      expiresIn: TOKEN_EXPIRES_TIME,
      issuer: config.jwtIssuer
    };
    try {
      return jwt.verify(token, publicKey, verifyOptions);
    } catch (err) {
      return null;
    }
  },

  decode: (token) => {
    return jwt.decode(token, { complete: true });
  }
}
