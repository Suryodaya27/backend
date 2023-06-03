const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/:typeId/banks/:bankId', async (req, res) => {
  try {
    const { typeId, bankId } = req.params;

    // Fetch the loan details for the specified loan type and bank
    const loan = await prisma.loan.findFirst({
      where: {
        typeId: Number(typeId),
        bankId: Number(bankId),
      },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Fetch additional loan type and bank details
    const loanType = await prisma.loanType.findUnique({
      where: {
        id: Number(typeId),
      },
    });

    const bank = await prisma.bank.findUnique({
      where: {
        id: Number(bankId),
      },
    });

    // Include interest rate and amount in the loan details
    const { id,interest, amount ,duration} = loan;
    const loanDetails = { ...loan, id,interest, amount,duration};

    // Return loan details along with loan type and bank details
    res.json({ loan: loanDetails, loanType, bank });
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ error: 'An error occurred while fetching loan details' });
  }
});

module.exports = router;
