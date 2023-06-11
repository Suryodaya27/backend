const express = require('express');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /dsa
router.post('/', async (req, res) => {
  const { dsaId, requestedAmount } = req.body;
  console.log(dsaId)
  try {
    const dsa = await prisma.dsa.findUnique({
        where: {
          dsaId: dsaId,
        },
      });

    if (!dsa) {
      return res.status(404).json({ error: 'Dsa not found' });
    }

    if (requestedAmount > dsa.commissionRemaining) {
      return res.status(400).json({ error: 'Insufficient commission remaining' });
    }

    const updatedDsa = await prisma.dsa.update({
      where: { dsaId : dsaId},
      data: { commissionRemaining: dsa.commissionRemaining - requestedAmount },
    });

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "pandeysuryodaya@gmail.com",
          pass: "vgqdokjmkadutkah",
        },
      });

    const mailOptions = {
      from: 'pandeysuryodaya@gmail.com',
      to: 'pandeysuryodaya@gmail.com', // Replace with the finance department's email address
      subject: 'DSA Money Request',
      text: `DSA ID: ${dsaId}\nRequested Amount: $${requestedAmount}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending failed:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Request processed successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
