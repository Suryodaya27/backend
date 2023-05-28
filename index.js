//imports 
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const session = require("express-session");

//create an instance of expres
const app = express();
app.use(express.json());

//add prisma
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


app.use(bodyParser.json());
const port= 3000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

app.post("/generate-password", async (req, res) => {
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

  // Save the password in the database.
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt
  const isAuthorized = req.body.isAuthorized; // Assuming the checkbox value is passed in the request body

  await prisma.user.create({
    data: {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: isAuthorized ? "authorized" : "normal", // Set the role based on the authorization status
    },
  });

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
    text: `hello ${user}!! Your unique password is: ${password}`,
  });

  res.status(201).send("User registered successfully.");
});

const secretKey = crypto.randomBytes(32).toString("hex");

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/login", async (req, res) => {
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
  res.status(200).send("User logged in successfully.");
});