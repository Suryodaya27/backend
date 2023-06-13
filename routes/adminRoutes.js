const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // Assuming you have a Prisma client instance

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  // Implement admin login logic here
});

// Endpoint to retrieve sorted DSAs
router.get('/admin/dsas', async (req, res) => {
  try {
    const sortedDSAs = await prisma.dsa.findMany({
      orderBy: {
        amountLoan: 'desc',
      },
      include:{
        user:{
            select:{
                username:true,
                email:true,
                phoneNumber:true,
            }
        },
      }
    });

    res.json(sortedDSAs);
  } catch (error) {
    console.error('Error retrieving sorted DSAs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch DSA performance
router.get('/admin/dsa/:id/performance/:months', async (req, res) => {
    try {
      const { id, months } = req.params;
  
      const durationMonths = parseInt(months);
  
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - durationMonths);
  
      const dsaPerformance = await prisma.dsa.findUnique({
        where: {
          dsaId: parseInt(id),
        },
        include: {
          applications: {
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          },
        },
      });
  
      res.json(dsaPerformance);
    } catch (error) {
      console.error('Error fetching DSA performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
