const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/:typeId/banks', async (req, res) => {
  try {
    const typeId = parseInt(req.params.typeId);
    const loans = await prisma.loan.findMany({
      where: {
        typeId: typeId,
      },
      include: {
        bank: true,
      },
    });
    const banks = loans.map((loan) => loan.bank);
    res.json(banks);
  } catch (error) {
    console.error('Error fetching banks for loan type:', error);
    res.status(500).json({ error: 'An error occurred while fetching banks' });
  }
});

module.exports = router;
