const jwt = require('jsonwebtoken');
const secretKey = require('./config')
// Generate a token with a secret key
// 1const secretKey = 'your-secret-key';
const token = jwt.sign({ userId: 3 }, secretKey);
// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY4NTc5OTkxMH0.d7UxEzrWWdUhYHpE_fDsWUggswvFNe6uveXbt7Exr0s";
const decoded = jwt.verify(token, secretKey);
module.exports = token;
// console.log(token);
// console.log(decoded);
