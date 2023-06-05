const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).json({ error: 'An error occurred during logout.' });
      } else {
        res.status(200).json({ message: 'User logged out successfully.' });
      }
    });
  } else {
    res.status(401).json({ error: 'User not logged in.' });
  }
});

module.exports = router;
