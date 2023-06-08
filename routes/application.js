const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authMiddleware');
const secretKey = require('../config');
const axios = require('axios')
const router = express.Router();

// POST endpoint for submitting loan application
router.post('/:typeId/banks/:bankId/application', verifyToken, async (req, res) => {
  try {
    const { typeId, bankId } = req.params;
    const { amount, interestRate, applicationName, applicationGovId, duration } = req.body;
    const { userId } = req;
    
    // Check if the userId is present in the request
    if (!userId) {
      res.status(401).json({ error: 'Access denied. User not authenticated.' });
      return;
    }

    // Find the loan based on the typeId and bankId
    const loan = await prisma.loan.findFirst({
      where: {
        typeId: parseInt(typeId),
        bankId: parseInt(bankId),
      },
    });

    if (!loan) {
      res.status(404).json({ error: 'Loan not found.' });
      return;
    }

    // Save the loan application data to the applications table
    const application = await prisma.application.create({
      data: {
        applicationName,
        applicationGovId,
        amount: parseInt(amount),
        duration: parseInt(duration),
        loanId: loan.id, // Use the found loan's ID
        userId: userId, // Associate the User ID
        statuses: { create: { status: 'Pending', userId: userId ,commissionAdded:false} }, // Associate the User ID
      },
      include: {
        loan: true,
        statuses: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Send the loan application data to the bank's API
    // const response = await axios.post('BANK_API_URL', {
    //   applicationId: application.id,
    //   amount: amount,
    //   interestRate: interestRate,
    //   // Include any other required data fields for the bank's API
    // });


    // res.json({ application });
    res.status(200).json({ application });
  } catch (error) {
    console.error('Error submitting loan application:', error);
    res.status(500).json({
      error: 'An error occurred while submitting the loan application',
    });
  }
});

module.exports = router;
