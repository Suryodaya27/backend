const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function submitLoanApplication(req, res) {
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
      address_pincode,
    } = req.body;

    // Perform eligibility check based on your business rules
    const isEligible = monthly_income > 20000;

    // Check eligibility
    if (!isEligible) {
      return res
        .status(400)
        .json({ status: "failure", errorMessage: "Not eligible for the loan" });
    }

    // Call the common function to handle the loan application
    const result = await handleLoanApplication(req.body, applicationId);

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error occurred:", error);
    return res
      .status(500)
      .json({ status: "failure", errorMessage: "An error occurred" });
  }
}

async function handleLoanApplication(data, applicationId) {
  // Deduplication check
  const requestId = Math.floor(100000 + Math.random() * 900000).toString();
  const dedupeData = { productName: "pl", requestId, panNumber: data.panNumber };
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
    return { status: 400, data: dedupeCheckResponse.data };
  }

  const duplicateFound = dedupeCheckResponse.data.duplicateFound;
  const matchingAttributes = dedupeCheckResponse.data.matchingAttributes;
  const nextRetryDate = dedupeCheckResponse.data.nextRetryDate;

  if (duplicateFound) {
    return {
      status: 200,
      data: {
        status: "success",
        data: {
          duplicateFound,
          matchingAttributes,
          nextRetryDate,
        },
      },
    };
  }

  // Register Start API
  const registerStartData = { userId: data.userId, mobileNo: data.mobileNo };
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
    return { status: 400, data: registerStartResponse.data };
  }

  const loanId = registerStartResponse.data.loanId;
  const skipApplicationDetails = registerStartResponse.data.skipApplicationDetails;

  if (registerStartResponse.data.status === "success") {
    if (!skipApplicationDetails) {
      const sendApplicationData = { ...data, loanId };
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
        return { status: 400, data: sendApplicationResponse.data };
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
      return { status: 400, data: getWebviewUrlResponse.data };
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

    return {
      status: 200,
      data: {
        status: "success",
        data: {
          loanId,
          webviewUrl,
        },
      },
    };
  }

  return { status: 400, data: { error: "Invalid typeId or bankId." } };
}

module.exports = {
  submitLoanApplication,
};