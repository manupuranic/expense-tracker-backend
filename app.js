const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const sequelize = require("./utils/database");
const userRouter = require("./routes/user");
const expenseRouter = require("./routes/expenses");
const purchaseRouter = require("./routes/purchase");
const premiumRouter = require("./routes/premium");
const passwordRouter = require("./routes/password");
const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const ForgotPasswordRequests = require("./models/forgotPasswordRequests");
const FileDownloads = require("./models/fileDownloads");

const app = express();

app.use(cors());
app.use(bodyParser.json({ extended: true }));

app.use("/user", userRouter);
app.use("/expenses", expenseRouter);
app.use("/purchase", purchaseRouter);
app.use("/premium", premiumRouter);
app.use("/password", passwordRouter);

app.use((req, res) => {
  // const incomingUrl = req.url;
  // const actualUrl = incomingUrl.split("+");
  // let sendUrl;
  // if (actualUrl.length === 1) {
  //   sendUrl = req.url;
  // } else {
  //   sendUrl = actualUrl[1];
  // }
  console.log("sendUrl", req.url);
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(FileDownloads);
FileDownloads.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port: 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
