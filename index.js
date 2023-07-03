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
const port = 4000;
app.use(cors());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", "'https://apis.google.com'"],
      // Add other directives as needed
    },
  })
);

const authMiddleware = require('./middlewares/authMiddleware');

// Test route that requires authentication
module.exports = app.get('/test', authMiddleware, (req, res) => {
  res.send('Authentication successful!');
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Import routes
const generatepassotp = require('./routes/signup')
const loginRoute = require('./routes/login');
const loantypes = require('./routes/loanTypes');
const loanBanks = require('./routes/loanBanks');
const loanInfo = require('./routes/loanInfo');
const application = require('./routes/application');
const userInfo = require('./routes/userInfo');
const webHook = require('./routes/webhook');
const commissionReq = require('./routes/commissionreq');
const adminRoutes = require('./routes/adminRoutes');

//webhooks
const prefrWebhook = require('./routes/webhook/prefr-webhook');

//banks urls
const prefr = require('./routes/banks/bank1service')

// Use routes as middleware
app.use('/api/' , generatepassotp);
app.use('/api/login', loginRoute);
app.use('/api/loan/types',loantypes);
app.use('/api/loan/types' ,loanBanks);
app.use('/api/loan/types' ,loanInfo);
app.use('/api/loan/types' , application);
app.use('/api/' , userInfo);
app.use('/api/finurl-webhook' , webHook);
app.use('/api/commissionreq' , commissionReq);
app.use('/api/', adminRoutes);
app.use('/api/', prefr);


app.use('/',prefrWebhook)