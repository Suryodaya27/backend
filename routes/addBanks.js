const express = require('express');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();


router.post("/", async (req, res) => {
    try {
      const { bank_name} = req.body;
      
      // Check if the bank already exists
      const existingBank = await prisma.bank.findFirst({
        where: {
          bank_name
        },
      });
  
      if (existingBank) {
        return res.status(409).json({ error: "Bank already exists" });
      }
      
      // Create a new bank record in the database
      const bank = await prisma.bank.create({
        data: {
          bank_name
        },
      });
  
      res.status(201).json({ message: "Bank added successfully", bank });
    } catch (error) {
      console.error("Error adding bank:", error);
      res.status(500).json({ error: "An error occurred while adding the bank" });
    }
  });
  
  router.get("/", async (req, res) => {
    try {
      // Retrieve all banks from the database
      const banks = await prisma.bank.findMany();
  
      res.status(200).json(banks);
    } catch (error) {
      console.error("Error retrieving banks:", error);
      res.status(500).json({ error: "An error occurred while retrieving banks" });
    }
  });

  module.exports = router;
  