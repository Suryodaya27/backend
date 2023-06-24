const express = require("express");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const router = express.Router();

router.post("/submitLoanApplication/prefr", async (req, res) => {
  try {
    const { 
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
        address_pincode } =
      req.body;

    // Perform eligibility check based on your business rules
    const eligibilityData = {
      monthly_income , dob
    };
    const isEligible = checkEligibility(eligibilityData);

    // Check eligibility
    if (!isEligible) {
      return res
        .status(400)
        .json({ status: "failure", errorMessage: "Not eligible for the loan" });
    }

    // Deduplication check
    const requestId = Math.floor(100000 + Math.random() * 900000).toString();
    const dedupeData = { productName: "pl", requestId, panNumber: pan_number };
    // const dedupeData = { loanId, firstName, lastName, personalEmailId };
    const dedupeCheckResponse = await axios.post(
      "https://host/marketplace/mw/loans/dedupe-check",
      dedupeData,
      {
        headers: {
          apikey: "YOUR_API_KEY",
          "Content-Type": "application/json",
        },
      }
    );

    if (
      dedupeCheckResponse.status !== 200 ||
      dedupeCheckResponse.data.status !== "success"
    ) {
      return res.status(400).json(dedupeCheckResponse.data);
    }

    const duplicateFound = dedupeCheckResponse.data.duplicateFound;
    const matchingAttributes = dedupeCheckResponse.data.matchingAttributes;
    const nextRetryDate = dedupeCheckResponse.data.nextRetryDate;

    if (duplicateFound) {
      return res.status(200).json({
        status: "success",
        data: {
          duplicateFound,
          matchingAttributes,
          nextRetryDate,
        },
      });
    }

    // Register Start API
    const registerStartData = {  userId: userId, mobileNo: applicant_phoneNumber };
    const registerStartResponse = await axios.post(
      "https://host/marketplace/mw/loans/v4/register-start/pl",
      registerStartData,
      {
        headers: {
          apikey: "YOUR_API_KEY",
          "Content-Type": "application/json",
        },
      }
    );

    if (
      registerStartResponse.status !== 200 ||
      registerStartResponse.data.status !== "success"
    ) {
      return res.status(400).json(registerStartResponse.data);
    }
    const loanId = registerStartResponse.data.loanId;
    const skipApplicationDetails =
      registerStartResponse.data.skipApplicationDetails;

    if (registerStartResponse.data.status === "success") {
      if (!skipApplicationDetails) {
        const sendApplicationData = {
            firstName:applicant_firstname,
            lastName:applicant_lastname,
            personalEmailId:email,
            gender,
            dob,
            panNumber:pan_number,
            netMonthlyIncome:monthly_income,
            desiredLoanAmount:loan_amount,
            employmentType:employment_type,
            currentAddress:current_address,
            currentAdressPincode:address_pincode,
            loanId };
        const sendApplicationResponse = await axios.post(
          "https://host/marketplace/mw/loans/v2/application-details",
          sendApplicationData,
          {
            headers: {
              apikey: "YOUR_API_KEY",
              "Content-Type": "application/json",
            },
          }
        );

        if (
          sendApplicationResponse.status !== 200 ||
          sendApplicationResponse.data.status !== "success"
        ) {
          return res.status(400).json(sendApplicationResponse.data);
        }
      }

      const getWebviewUrlData = { loanId };
      const getWebviewUrlResponse = await axios.post(
        "https://host/marketplace/mw/loans/get-webview",
        getWebviewUrlData,
        {
          headers: {
            apikey: "YOUR_API_KEY",
            "Content-Type": "application/json",
          },
        }
      );

      if (
        getWebviewUrlResponse.status !== 200 ||
        getWebviewUrlResponse.data.status !== "success"
      ) {
        return res.status(400).json(getWebviewUrlResponse.data);
      }

      const webviewUrl = getWebviewUrlResponse.data.webviewUrl;
      // Create a new row in the `prefr` table with loanId and applicationId
      const prismaData = {
        loanId,
        applicationId: applicationId, // Replace this with the relevant applicationId
      };
      const prefr = await prisma.prefr.create({
        data: prismaData,
      });

      return res.status(200).json({
        status: "success",
        data: {
          webviewUrl,
        },
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        loanId,
        skipApplicationDetails,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res
      .status(500)
      .json({ status: "failure", errorMessage: "An error occurred" });
  }
});

function checkEligibility(data) {
  const { dob, monthly_income } = data;

  // Calculate the age based on the date of birth
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  // Check if the age is greater than 18 and the monthly income is greater than 20000
  if (age <= 18 || monthly_income <= 20000) {
    return false;
  }

  return true;
}

module.exports = router;
