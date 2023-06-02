const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const loanTypes = await prisma.loanType.findMany();
    res.json(loanTypes);
  } catch (error) {
    console.error('Error fetching loan types:', error);
    res.status(500).json({ error: 'An error occurred while fetching loan types' });
  }
});

module.exports = router;
