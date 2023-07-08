const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Configure your routes and middleware here

app.use(express.json());
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
app.get('/test', authMiddleware, (req, res) => {
  res.send('Authentication successful!');
});

// Import routes
const generatepassotp = require('./routes/signup');
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
const prefr = require('./routes/banks/bank1service');

// Use routes as middleware
app.use('/api/', generatepassotp);
app.use('/api/login', loginRoute);
app.use('/api/loan/types', loantypes);
app.use('/api/loan/types', loanBanks);
app.use('/api/loan/types', loanInfo);
app.use('/api/loan/types', application);
app.use('/api/', userInfo);
app.use('/api/finurl-webhook', webHook);
app.use('/api/commissionreq', commissionReq);
app.use('/api/', adminRoutes);
app.use('/api/', prefr);

app.use('/', prefrWebhook);

// Read the SSL certificate files
const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.finurl.in/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.finurl.in/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.finurl.in/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the server
httpsServer.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
