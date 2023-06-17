const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // Assuming you have a Prisma client instance
const secretKey = require('../config');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authMiddleware');

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username and password
    const admin = await prisma.admin.findFirst({
      where: {
        adminUsername: username,
        adminPassword: password,
      },
    });

    // If the admin does not exist or password doesn't match, return an error
    if (!admin) {
      res.status(401).send('Invalid username or password.');
      return;
    }

    // Generate a token containing the admin's ID and other necessary data
    const token = jwt.sign({ adminId: admin.adminId }, secretKey);

    // Send the token to the client
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('An error occurred during login.');
  }
});

// Endpoint to retrieve sorted DSAs
router.get('/admin/dsa',verifyToken, async (req, res) => {
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
router.get('/admin/dsa/:id/performance/:months',verifyToken, async (req, res) => {
    try {
      const { id, months } = req.params;
  
      const durationMonths = parseInt(months);
  
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - durationMonths);
  
      // const dsaPerformance = await prisma.user.findFirst({
      //   where: {
      //     id: parseInt(id),
      //     role: 'authorized',
      //   },
      //   include: {
      //     applications: {
      //       where: {
      //         createdAt: {
      //           gte: startDate,
      //         },
      //       },
      //     },
      //   },
      // });
      const applications = await prisma.application.findMany({
        where:{
          userId:parseInt(id),
          createdAt: {
            gte: startDate,
          },
        }
      })
  
      // res.json(dsaPerformance);
      res.json(applications)
    } catch (error) {
      console.error('Error fetching DSA performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
