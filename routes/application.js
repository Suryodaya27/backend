const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/authMiddleware");
const secretKey = require("../config");
const axios = require("axios");
const router = express.Router();

const bank1service = require("./banks/bankservice1");

// POST endpoint for submitting loan application
router.post(
  "/:typeId/banks/:bankId/application",
  verifyToken,
  async (req, res) => {
    try {
      const { typeId, bankId } = req.params;
      const {
        applicant_firstname,
        applicant_lastname,
        applicant_phoneNumber,
        email,
        gender,
        dob,
        pan_number,
        monthly_income,
        loan_amount,
        employment_type,
        current_address,
        address_pincode,
      } = req.body;
      const { userId } = req;

      // Check if the userId is present in the request
      if (!userId) {
        res
          .status(401)
          .json({ error: "Access denied. User not authenticated." });
        return;
      }

      // Find the loan based on the typeId and bankId
      const loan = await prisma.loan.findFirst({
        where: {
          typeId: parseInt(typeId),
          bankId: parseInt(bankId),
        },
      });

      if (!loan) {
        res.status(404).json({ error: "Loan not found." });
        return;
      }

      // Save the loan application data to the applications table
      const application = await prisma.application.create({
        data: {
          applicationName: applicant_firstname + " " + applicant_lastname,
          applicationGovId: pan_number,
          amount: loan_amount,
          monthly_income,
          loanId: loan.id, // Use the found loan's ID
          userId: userId, // Associate the User ID
          statuses: {
            create: {
              status: "Pending",
              remark: "Application has been sent to bank",
              userId: userId,
              commissionAdded: false,
            },
          },
        },
        include: {
          loan: true,
          statuses: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (application) {
        applicationId = application.id;
      }

      const bankData = {
        applicationId,
        userId,
        applicant_firstname,
        applicant_lastname,
        applicant_phoneNumber,
        email,
        gender,
        dob,
        pan_number,
        monthly_income,
        loan_amount,
        employment_type,
        current_address,
        address_pincode,
      };
      bankData.propertyName = null;
      const jsonData = JSON.stringify(bankData);
      // Instead of assigning the entire response object, extract only the required properties
      let responseData = {};

      // Dynamically route the request to the appropriate service based on typeId and bankId
      if (loan.id == 1) {
        // Route to Bank 1's API logic
        url = "http://localhost:3001/submitLoanApplication/prefr";
        const bankResponse = await axios.post(url, jsonData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        responseData.loanId = bankResponse.data.data.loanId;
        responseData.weburl = bankResponse.data.data.weburl;
      }
      // else if (typeId === '2' && bankId === '2') {
      //   // Route to Bank 2's API logic
      //   await bank2Service.submitLoanApplication(req.body);
      // }
      else {
        res.status(400).json({ error: "Invalid typeId or bankId." });
        return;
      }

      res.status(200).json({ responseData });
    } catch (error) {
      console.error("Error submitting loan application:", error);
      res.status(500).json({
        error: "An error occurred while submitting the loan application",
      });
    }
  }
);

module.exports = router;
