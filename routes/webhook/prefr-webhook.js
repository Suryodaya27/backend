// webhookRouter.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const winston = require('winston');
const prisma = new PrismaClient();

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
    }),
  ],
});

const router = express.Router();

// POST endpoint for receiving webhook callbacks from the bank
router.post('/prefr-webhook', async (req, res) => {
  try {
    const { loanId, eventName, data } = req.body;
    const { selectedOfferDetails } = data;
    const { loanAmount } = selectedOfferDetails;

    // Search for applicationId in the "prefr" table using loanId
    const prefrEntry = await prisma.prefr.findUnique({
      where: { loanId },
    });

    if (!prefrEntry) {
      // Return an error response if the prefr entry is not found
      return res.status(400).json({
        success: false,
        error: 'No matching application found for the provided loanId',
      });
    }

    const applicationId = prefrEntry.applicationId;

    // Update the application status in the database based on the webhook data
    const updatedStatus = await prisma.status.updateMany({
      where: { applicationId: parseInt(applicationId) },
      data: { status: eventName, remark: eventName},
    });

    // If the application status is 'Disbursed', update DSA commission
    if (eventName === 'disbursal_success') {
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
        const commissionPercentage = application.loan.commission;
        const dsa = await prisma.dsa.findUnique({
          where: { dsaId: application.user.id },
        });
        const dsaCommissionPercentage = dsa.commissionPercentage;

        // Calculate the commission and increment values
        const commission = loanAmount * (commissionPercentage / 100);
        const increment = commission * (dsaCommissionPercentage / 100);

        // Update the DSA commission and application details in the database within a transaction
        await prisma.$transaction([
          prisma.dsa.update({
            where: { dsaId: application.user.id },
            data: {
              totalCommission: { increment: increment },
              commissionRemaining: { increment: increment },
              amountLoan: { increment: loanAmount },
              loansIssued: { increment: 1 },
            },
          }),
          prisma.status.update({
            where: { id: application.statuses[0].id },
            data: { commissionAdded: true },
          }),
        ]);
      }
    }

    // Return a standardized success response
    res.status(200).json({ success: true, status: updatedStatus });
  } catch (error) {
    logger.error('Error updating application status:', error);

    // Return a standardized error response
    res.status(500).json({
      success: false,
      error: 'An error occurred while updating the application status',
    });
  }
});

module.exports = router;
