const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a random secret key
// const secretKey = crypto.randomBytes(32).toString('hex');
const secretKey = require('../config');

const token = require('../tokenGenerator') 
// const secretKey = 'your-secret-key'; // Replace with your own secret key

const verifyToken = (req, res, next) => {
  // const token = req.headers.authorization;

  if (!token) {
    res.status(401).send('Access denied. Token missing.');
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).send('Invalid token.');
  }
};

module.exports = verifyToken;
