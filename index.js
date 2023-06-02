// imports
const express = require('express');
const bodyParser = require('body-parser');
const session = require("express-session");

// create an instance of express
const app = express();
app.use(express.json());

// add prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(bodyParser.json());
const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Import routes
const generatePasswordRoute = require('./routes/generatePassword');
const loginRoute = require('./routes/login');
const addBank = require('./routes/addBanks');
const loantypes = require('./routes/loanTypes');
const loanBanks = require('./routes/loanBanks');

// Use routes as middleware
app.use('/generate-password', generatePasswordRoute);
app.use('/login', loginRoute);
app.use('/addbank' , addBank);
app.use('/loan/types',loantypes);
app.use('/loan/types' ,loanBanks);
