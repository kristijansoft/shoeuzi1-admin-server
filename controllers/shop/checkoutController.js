const express = require('express');
const router = express.Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST);
const httpStatus = require('../../lib/httpStatus');

/* Stripe charge payment */
router.post('/charge', [], async (req, res) => {
  console.log('route reached', req.body);
  let { amount, id } = req.body;
  console.log('amount and id', amount, id);
  try {
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'USD',
      description: 'Shoeuzi payment',
      payment_method: id,
      confirm: true,
    });
    console.log('payment', payment);
    res.status(httpStatus.OK).send({
      status: true,
      data: payment,
    });
    res.json({
      message: 'Payment Successful',
      success: true,
    });
  } catch (error) {
    console.log('error', error);
    res.json({
      message: 'Payment Failed',
      success: false,
    });
  }
});

module.exports = router;
