// webhookRouter.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// POST endpoint for receiving webhook callbacks from the bank
router.post('/', async (req, res) => {
  try {
    const { applicationId, status ,remark} = req.body;

    // Update the application status in the database based on the webhook data
    const updatedStatus = await prisma.status.updateMany({
      where: { applicationId: parseInt(applicationId) },
      data: { status,remark },
    });

    // If the application status is 'Approved', update DSA commission
    if (status === 'Disbursed') {
      const application = await prisma.application.findUnique({
        where: { id: parseInt(applicationId) },
        include: {
          loan: true,
          user: true,
          statuses: true,
        },
      });

      if (
        application.user.role === 'authorized' &&
        application.statuses &&
        !application.statuses[0]?.commissionAdded
      ) {
        const loanAmount = application.amount;
        const commissionPercentage = application.loan.commission;
        const dsa = await prisma.dsa.findUnique({
          where: { dsaId: application.user.id  },
        });
        const dsaCommissionPercentage = dsa.commissionPercentage;
        // Calculate the commission
        const commission = loanAmount * (commissionPercentage / 100);
    
        // Calculate the increment value
        const increment = commission * (dsaCommissionPercentage/100);
        // Update the DSA commission in the database
        await prisma.dsa.update({
          where: { dsaId: application.user.id },
          data: {
            totalCommission: {
              increment: increment, // Increment the commission by the calculated increment value
            },
            commissionRemaining: {
              increment: increment,
            },
            amountLoan: {
              increment: loanAmount,
            },
            loansIssued: {
              increment: 1, // Increment the number of loans issued by 1
            },
          },
        });
    
        // Update the commission status in the statuses table
        await prisma.status.update({
          where: {
            id: application.statuses[0].id,
          },
          data: {
            commissionAdded: true,
          },
        });
    
      }
    }

    res.json({ status: updatedStatus });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      error: 'An error occurred while updating the application status',
    });
  }
});

module.exports = router;
