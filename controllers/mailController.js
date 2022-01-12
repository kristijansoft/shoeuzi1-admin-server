const express = require('express');
const router = express.Router();
require('dotenv').config();
const httpStatus = require('../lib/httpStatus');

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const nodemailer = require('nodemailer')
// create transporter object with smtp server details
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
  }
});

router.post('/send', [], async (req, res) => {
  console.log('mail sending =>')
  try {
    const res = await transporter.sendMail({
      from: 'admin@byjldn.com',
      to: 'yaroslav.bura7io@gmail.com',
      subject: 'Test Email Subject',
      html: '<h1>Shoeuzi. Example HTML Message Body</h1>'
    });
    console.log(res.data)
    res.status(httpStatus.OK).send({
      status: true,
      data: 'Sent',
    });

  } catch (error) {
    console.log(error)
    return res
      .status(httpStatus.OK)
      .send({ status: false, msg: `Server error: ${error.message}` });
  }
})

router.post('/send-by-sendgrid', [], async (req, res) => {
  try {
    const msg = {
      to: 'yaroslav.bura7io@gmail.com', // Change to your recipient
      from: 'admin@byjldn.com', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
      })
    
  } catch (error) {
    console.log('error', error);
    res.json({
      message: 'Payment Failed',
      success: false,
    });
  }
})

module.exports = router