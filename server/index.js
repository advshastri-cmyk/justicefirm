// server/index.js
// Minimal Express server to accept payment confirmation and send receipts.
// Run: npm install express multer nodemailer cors dotenv fs-extra
// Start: node index.js (after filling .env)

const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const RECEIPTS_FILE = path.join(__dirname, 'receipts.json');

fs.ensureDirSync(UPLOAD_DIR);
if(!fs.existsSync(RECEIPTS_FILE)) fs.writeJsonSync(RECEIPTS_FILE, []);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g,'_');
    cb(null, name);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // serve the site

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT||587,10),
  secure: (process.env.SMTP_SECURE === 'true'), // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// POST /api/receipt
app.post('/api/receipt', upload.single('screenshot'), async (req, res) => {
  try {
    const { payerName, payerEmail, amount, txn, payeeUpi } = req.body;
    if(!payerName || !payerEmail || !amount) return res.status(400).json({ success:false, message:'Missing required fields' });

    const record = {
      id: 'R' + Date.now(),
      payerName,
      payerEmail,
      amount: parseFloat(amount),
      txn: txn || '',
      payeeUpi: payeeUpi || '',
      screenshot: req.file ? path.basename(req.file.path) : '',
      createdAt: new Date().toISOString()
    };

    // Append to receipts.json
    const receipts = await fs.readJson(RECEIPTS_FILE);
    receipts.push(record);
    await fs.writeJson(RECEIPTS_FILE, receipts, { spaces:2 });

    // Send email to client (payer)
    const clientMailOptions = {
      from: process.env.EMAIL_FROM,
      to: payerEmail,
      subject: `Receipt — The Justice Firm — INR ${record.amount}`,
      html: `
        <p>Dear ${payerName},</p>
        <p>Thank you for your payment of <strong>₹${record.amount}</strong> to The Justice Firm.</p>
        <p>Receipt ID: <strong>${record.id}</strong><br/>
           Payment reference: ${record.txn || '—'}</p>
        <p>If you need an invoice or any assistance, reply to this email.</p>
        <p>Regards,<br/>The Justice Firm</p>
      `
    };

    // Send email to firm/admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.FIRM_EMAIL,
      subject: `New Payment Received — ${record.amount} — ${record.payerName}`,
      html: `
        <p>New payment recorded:</p>
        <ul>
          <li>Receipt ID: ${record.id}</li>
          <li>Payer: ${record.payerName} (${record.payerEmail})</li>
          <li>Amount: ₹${record.amount}</li>
          <li>TXN: ${record.txn || '—'}</li>
          <li>UPI ID: ${record.payeeUpi}</li>
          <li>Time: ${record.createdAt}</li>
        </ul>
        <p>Screenshot: ${record.screenshot ? `<a href="${process.env.PUBLIC_URL || ''}/uploads/${encodeURIComponent(record.screenshot)}" target="_blank">View</a>` : 'Not provided'}</p>
      `
    };

    // send both emails (no await race)
    await transporter.sendMail(clientMailOptions);
    await transporter.sendMail(adminMailOptions);

    return res.json({ success:true, id: record.id });
  } catch (err) {
    console.error('Receipt error:', err);
    return res.status(500).json({ success:false, message:'Server error' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
