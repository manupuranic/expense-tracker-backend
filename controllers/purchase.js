const Razorpay = require("razorpay");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const sequelize = require("../utils/database");
const generateWebToken = (id, isPremium) => {
  return jwt.sign({ userId: id, isPremium: isPremium }, process.env.JWT_SECRET);
};

exports.purchasePremium = async (req, res, next) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create(
      {
        amount,
        currency: "INR",
      },
      (err, order) => {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        req.user
          .createOrder({
            orderId: order.id,
            status: "PENDING",
          })
          .then(() => {
            return res.status(201).json({ order, key_id: rzp.key_id });
          })
          .catch((err) => {
            throw new Error(err);
          });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(403).json({
      message: "Something went wrong",
      error: err,
    });
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { payment_id, order_id, success } = req.body;
    if (success) {
      const [order] = await Promise.all([
        Order.findOne({ where: { orderId: order_id } }, { transaction: t }),
        req.user.update({ isPremium: true }, { transaction: t }),
      ]);
      // const order = await Order.findOne({ where: { orderId: order_id } });
      // await req.user.update({ isPremium: true });
      await order.update(
        { paymentId: payment_id, status: "SUCCESSFUL" },
        { transaction: t }
      );
      await t.commit();
      const token = generateWebToken(req.user.id, req.user.isPremium);
      return res.status(202).json({
        success: true,
        message: "Transaction Successful",
        token: token,
      });
    } else {
      const order = await Order.findOne(
        { where: { orderId: order_id } },
        { transaction: t }
      );
      await order.update({ status: "FAILED" }, { transaction: t });
      await t.commit();
      return res.status(404).json({
        success: false,
        message: "Transaction Failed",
      });
    }
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(404).json({
      success: false,
      message: err,
    });
  }
};
