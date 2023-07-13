const express = require("express");

const purchaseController = require("../controllers/purchase");
const userController = require("../middleware/auth");

const router = express.Router();

router.get(
  "/premiummembership",
  userController.authenticate,
  purchaseController.purchasePremium
);

router.post(
  "/updatetransactionstatus",
  userController.authenticate,
  purchaseController.updateOrderStatus
);

module.exports = router;
