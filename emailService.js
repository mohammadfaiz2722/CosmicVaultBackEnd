const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "myyard789@gmail.com" ,
    pass: "cmvankwrmhydhjkm"
  }
});

const sendEmail = (to, subject, text) => {
  console.log(`Sending email to: ${to}`);
// console.log(process.env.EMAIL,process.env.EMAIL_PASSWORD )
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html: `<p>Hello,</p>
           <p>${text}</p>
           <p>Best regards,<br>Cosmic Vault</p>`,
    headers: {
      'X-Priority': '3', // Normal priority
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal'
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error sending email:', error);
    }
    console.log('Email sent: ' + info.response);
  });
};

module.exports = sendEmail;
