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
    const userinfo = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select:{
        id:true,
        username:true,
        email:true,

      }
    })


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
    const dsainfo = await prisma.dsa.findFirst({
      where: { dsaId: parseInt(userId) },
      select: { 
        totalCommission: true ,
        commissionRemaining:true,
        amountLoan:true,
        loansIssued:true,
      },
    });
    
    // const commission = dsa ? dsa.totalCommission  : null;
    // const remainingCommision= dsa ? dsa.commissionRemaining : null;
    // const amountLoan = dsa ? dsa.amountLoan : null;
    // const loansIssued = dsa ? dsa.loansIssued : null;
    

    res.status(200).json({ userinfo,loans, dsainfo});
  } catch (error) {
    console.error('Error retrieving issued loans:', error);
    res.status(500).json({ error: 'An error occurred while retrieving issued loans' });
  }
});

module.exports = router;
