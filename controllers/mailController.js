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
  const { toAddress, subject, html } = req.body
  try {
    transporter.sendMail({
      from: process.env.SENDGRID_FROM_EMAIL,
      to: toAddress,
      subject: subject,
      html: html
    }, function(error, info) {
      if (error) {
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .send({ status: false, msg: `Server error: ${error.message}` });
      }
      return res.status(httpStatus.OK).send({
        status: true,
        data: info.response
      });
    });

  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ status: false, msg: `Server error: ${error.message}` });
  }
})

router.post('/send-by-sendgrid', [], async (req, res) => {
  const { toAddress, subject, html, text } = req.body
  try {
    const msg = {
      to: toAddress,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: subject,
      text: text,
      html: html,
    }
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
        return res.status(httpStatus.OK).send({
          status: true,
          data: 'Sent',
        });
      })
      .catch((error) => {
        console.error(error)
      })
    
  } catch (error) {
    console.log('error', error);
    return res.json({
      message: 'Payment Failed',
      success: false,
    });
  }
})

module.exports = router