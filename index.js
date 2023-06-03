// imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
// create an instance of express
const app = express();
app.use(express.json());

// add prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(bodyParser.json());
const port = 3000;
app.use(cors());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", "'https://apis.google.com'"],
      // Add other directives as needed
    },
  })
);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Import routes
const generatePasswordRoute = require('./routes/generatePassword');
const loginRoute = require('./routes/login');
const addBank = require('./routes/addBanks');
const loantypes = require('./routes/loanTypes');
const loanBanks = require('./routes/loanBanks');
const loanInfo = require('./routes/loanInfo');
const application = require('./routes/application');

// Use routes as middleware
app.use('/generate-password', generatePasswordRoute);
app.use('/login', loginRoute);
app.use('/addbank' , addBank);
app.use('/loan/types',loantypes);
app.use('/loan/types' ,loanBanks);
app.use('/loan/types' ,loanInfo);
app.use('/loan/types' , application);
