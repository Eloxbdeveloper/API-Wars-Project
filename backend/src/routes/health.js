const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "API WARS API is running"
  });
});

module.exports = router;
