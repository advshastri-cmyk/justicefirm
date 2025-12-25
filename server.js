// server.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// ✅ Strong Email Regex
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

// ✅ Strong Mobile Regex (India style: 10 digits, starts with 6-9)
function isValidMobile(mobile) {
  const re = /^[6-9][0-9]{9}$/;
  return re.test(mobile);
}

// 📩 API Endpoint
app.post("/send-transcript", (req, res) => {
  const { email, mobile, subject, message } = req.body;

  // Backend Validation with Regex only
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!isValidMobile(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  // अगर regex पास हो गया तो success response
  console.log("Transcript received:");
  console.log("Email:", email);
  console.log("Mobile:", mobile);
  console.log("Subject:", subject);
  console.log("Message:", message);

  return res.json({ success: true, message: "Transcript processed successfully" });
});

// 🚀 Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
