const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authMiddleware');
const secretKey = require('../config');

const router = express.Router();

// POST endpoint for submitting loan application
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
        statuses: { create: { status: 'Pending', userId: userId } }, // Associate the User ID
      },
      include: {
        loan: true,
        statuses: true,
        user: true,
      },
    });

    // Call the bank's API to send the loan application data
    const response = await callBankAPI(application);

    // Update the status based on the response from the bank's API
    let status = 'Rejected';
    if (response.status === 'approved') {
      status = 'Approved';
    }

    // Update the existing status record in the database
    const updatedStatus = await prisma.status.updateMany({
      where: { applicationId: application.id },
      data: { status: 'Approved' },
    });
    if (application.user.role === 'authorized') {
      const loanAmount = application.amount;
      const commissionPercentage = loan.commisssion;

      // Calculate the commission
      const commission = loanAmount * (commissionPercentage / 100);

      // Update the DSA commission in the database
      await prisma.dsa.update({
        where: { dsaId: application.user.id },
        data: {
          commission: {
            increment: commission * 0.3, // Increment the commission by 30% of the calculated commission
          },
        },
      });
    }

    res.json({ application, status: updatedStatus });
  } catch (error) {
    console.error('Error submitting loan application:', error);
    res.status(500).json({
      error: 'An error occurred while submitting the loan application',
    });
  }
});

// Function to call the bank's API and send the loan application data
async function callBankAPI(application) {
  // Make the necessary API request to the bank using the application data
  // Replace this code with the actual implementation to send data to the bank's API

  // For demonstration purposes, returning a mock response
  return { status: 'approved' };
}

module.exports = router;
