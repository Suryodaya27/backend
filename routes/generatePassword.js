// routes/generatePassword.js
const express = require('express');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  // Validate the user's input.
  if (!req.body.username || !req.body.email) {
    res.status(400).send("Please provide a valid username and email.");
    return;
  }

  // Check if the username or email already exists in the database.
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.username === req.body.username) {
      res.status(409).send("Username already in use.");
    } else if (existingUser.email === req.body.email) {
      res.status(409).send("Email address already in use.");
    }
    return;
  }

  // Generate a unique password.
  const password = crypto.randomBytes(3).toString("hex");

  // Save the password and user in the database.
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt
  const isAuthorized = req.body.isAuthorized; // Assuming the checkbox value is passed in the request body

  let newUser;

  if (isAuthorized) {
    newUser = await prisma.user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: "authorized", // Set the role as authorized
        dsa: { // Create the DSA entry
          create: {
            totalCommission: 0,
            commissionRemaining:0, // Set the initial commission to 0
            amountLoan:0,
            loansIssued:0,
            commissionPercentage:20
          },
        },
      },
    });
  } else {
    newUser = await prisma.user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: "normal", // Set the role as normal
      },
    });
  }

  // Send an email with the unique password to the user.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "pandeysuryodaya@gmail.com",
      pass: "vgqdokjmkadutkah",
    },
  });
  const user = req.body.username;
  await transporter.sendMail({
    from: "pandeysuryodaya@gmail.com",
    to: req.body.email,
    subject: "Your unique password",
    text: `Hello ${user}! Your unique password is: ${password}`,
  });

  res.status(201).send("User registered successfully.");
});

module.exports = router;
