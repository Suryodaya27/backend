const express = require('express');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require('jsonwebtoken');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// const secretKey = crypto.randomBytes(32).toString("hex");
const secretKey = require('../config')

router.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set secure flag to true
    },
  })
);

router.post("/", async (req, res) => {
  // Validate the user's input.
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Please provide a valid username and password.");
    return;
  }

  // Check if the user exists in the database.
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  });
  

  // If the user doesn't exist or the password is incorrect, return an error.
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    res.status(401).send("Invalid username or password.");
    return;
  }

  // Login the user and redirect them to the home page.
  req.session.user = user;
  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

  res.status(200).send("User logged in successfully. ");
});

module.exports = router;