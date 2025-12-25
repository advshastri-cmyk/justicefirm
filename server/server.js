// /server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

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
app.post("/send-transcript", async (req, res) => {
  const { email, mobile, subject, message } = req.body;

  // Backend Validation with Regex only
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (!isValidMobile(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  try {
    // ✅ Gmail Transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "adv.shastri@gmail.com",      // apna Gmail address yahan dalen
        pass: "eiuxaofilpjzmlch"         // yahan 16-digit App Password paste karein
      }
    });

    // Email Options
    let mailOptions = {
      from: '"The Justice Firm" <yourgmail@gmail.com>',
      to: email,
      subject: subject,
      text: message
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    console.log("Transcript emailed successfully to:", email);
    return res.json({ success: true, message: "Transcript emailed successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// 🚀 Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
