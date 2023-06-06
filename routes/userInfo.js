const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users/:userId/loans', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      res.status(400).json({ error: 'Invalid userId' });
      return;
    }

    // Retrieve the user's issued loans and their statuses, including loan and bank details
    const loans = await prisma.application.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        statuses: true,
        loan: {
          include: {
            bank: true,
            loanType: true,
          },
        },
      },
    });

    // Retrieve the user's DSA commission if user is DSA
    const dsa = await prisma.dsa.findFirst({
      where: { dsaId: parseInt(userId) },
      select: { commission: true },
    });
    
    const commission = dsa ? dsa.commission : 0;
    

    res.status(200).json({ loans, commission });
  } catch (error) {
    console.error('Error retrieving issued loans:', error);
    res.status(500).json({ error: 'An error occurred while retrieving issued loans' });
  }
});

module.exports = router;
