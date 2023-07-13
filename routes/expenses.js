const express = require("express");

const expenseController = require("../controllers/expense");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

router.post(
  "/add-expense",
  userAuthentication.authenticate,
  expenseController.addExpense
);

router.delete(
  "/delete-expense/:id",
  userAuthentication.authenticate,
  expenseController.deleteExpense
);

router.get(
  "/download",
  userAuthentication.authenticate,
  expenseController.downloadExpenses
);

router.get(
  "/filedownloads",
  userAuthentication.authenticate,
  expenseController.getFileDownloads
);

router.get(
  "/:id",
  userAuthentication.authenticate,
  expenseController.getExpenses
);

module.exports = router;
