const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message:
    "Too many accounts created from this IP, please try again after 15 minutes"
});