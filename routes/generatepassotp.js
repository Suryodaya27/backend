const express = require('express');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
// const twilio = require("twilio");
const session = require("express-session");
const { v4: uuidv4 } = require('uuid');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();
// const client = twilio(YOUR_TWILIO_ACCOUNT_SID, YOUR_TWILIO_AUTH_TOKEN);

// Configure session middleware
router.use(session({
  genid: (req) => uuidv4(), // Generate a unique session ID for each user
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
}));

router.post("/generate-password", async (req, res) => {
  // Validate the user's input.
  if (!req.body.username || !req.body.email || !req.body.phoneNumber) {
    res.status(400).send("Please provide a valid username, email, and phone number.");
    return;
  }

  // Check if the username, email, or phone number already exists in the database.
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: req.body.username },
        { email: req.body.email },
        { phoneNumber: req.body.phoneNumber }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.username === req.body.username) {
      res.status(409).send("Username already in use.");
    } else if (existingUser.email === req.body.email) {
      res.status(409).send("Email address already in use.");
    } else if (existingUser.phoneNumber === req.body.phoneNumber) {
      res.status(409).send("Phone number already in use.");
    }
    return;
  }

  // Generate and send the OTP to the provided phone number.
  const otp = generateOTP();


  //otp sending on users phone
//   try {
//     await sendOTP(req.body.phoneNumber, otp);
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     res.status(500).send("Error sending OTP.");
//     return;
//   }

  // Generate a unique session ID for the user
  const sessionId = req.sessionID;
  console.log(sessionId)
  // Save the user details and the generated OTP in the session store.
  req.sessionStore.set(sessionId, {
    username: req.body.username,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    isAuthorized: req.body.isAuthorized,
    password: null,
    otp: otp
  });

  // Send the session ID to the client
  res.status(200).json({ sessionId: sessionId });
});

router.post("/verify-otp", async (req, res) => {
  // Retrieve the session ID from the request body.
  const sessionId = req.body.sessionId;

  // Retrieve the user data from the session store using the session ID.
  const userData = await getSessionData(req,sessionId);
    console.log(userData)
  if (!userData) {
    res.status(404).send("User not found.");
    return;
  }
  console.log(req.body.otp);
  console.log(userData.otp);
  // Validate the submitted OTP.
  if (req.body.otp !== userData.otp) {
    res.status(401).send("Invalid OTP.");
    return;
  }

  // Generate a unique password.
  const password = crypto.randomBytes(3).toString("hex");

  // Hash the password with bcrypt.
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the password and user in the database.
  const isAuthorized = userData.isAuthorized;

  let newUser;

  if (isAuthorized) {
    newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: hashedPassword,
        role: "authorized",
        dsa: {
          create: {
            totalCommission: 0,
            commissionRemaining: 0,
            amountLoan: 0,
            loansIssued: 0,
            commissionPercentage: 20,
          },
        },
      },
    });
  } else {
    newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: hashedPassword,
        role: "normal",
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

  const user = userData.username;

  await transporter.sendMail({
    from: "pandeysuryodaya@gmail.com",
    to: userData.email,
    subject: "Your unique password",
    text: `Hello ${user}! Your unique password is: ${password}`,
  });

  // Send a notification to your company
  await sendCompanyNotification(userData.username, newUser.id);

  // Remove the session data from the session store.
  await req.sessionStore.destroy(sessionId);

  res.status(201).send("User registered successfully.");
});

async function getSessionData(req, sessionId) {
    return new Promise((resolve, reject) => {
      req.sessionStore.get(sessionId, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

function generateOTP() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(otp);
  return otp;
}

// async function sendOTP(phoneNumber, otp) {
//   await client.messages.create({
//     body: `Your OTP is ${otp}`,
//     from: YOUR_TWILIO_PHONE_NUMBER,
//     to: phoneNumber
//   });
// }

async function sendCompanyNotification(username, userId) {
    // Replace the following with your email service configuration
    const transporter = nodemailer.createTransport({
      host: "your-smtp-host",
      port: 587,
      secure: false,
      auth: {
        user: "your-email@example.com",
        pass: "your-email-password",
      },
    });
  
    const mailOptions = {
      from: "your-email@example.com",
      to: "company-email@example.com",
      subject: "New authorized user sign-up",
      text: `A new authorized user has signed up:\n\nUsername: ${username}\nUser ID: ${userId}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Company notification email sent successfully");
    } catch (error) {
      console.error("Error sending company notification email:", error);
    }
  }



router.post("/reset", async (req, res) => {
    // Validate the user's input.
    if (!req.body.username || !req.body.email) {
      res.status(400).send("Please provide a valid username and email.");
      return;
    }
  
    // Check if the username and email exist in the database.
    const existingUser = await prisma.user.findFirst({
      where: {
        username: req.body.username,
        email: req.body.email
      },
    });
  
    if (!existingUser) {
      res.status(404).send("User not found.");
      return;
    }
  
    // Generate a new unique password.
    const newPassword = crypto.randomBytes(3).toString("hex");
  
    // Update the password in the database.
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password with bcrypt
  
    await prisma.user.update({
      where: {
        id: existingUser.id
      },
      data: {
        password: hashedPassword
      }
    });
  
    // Send an email with the new password to the user.
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
      subject: "Your new password",
      text: `Hello ${user}! Your new password is: ${newPassword}`,
    });
  
    res.status(200).send("Password reset successfully.");
  });



module.exports = router;
