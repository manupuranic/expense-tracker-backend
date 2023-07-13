// const Expense = require("../models/expense");
// const User = require("../models/user");
const FileDownloads = require("../models/fileDownloads");
const sequelize = require("../utils/database");
const AWS = require("aws-sdk");

exports.addExpense = async (req, res, next) => {
  const { amount, desc, category } = req.body;
  const t = await sequelize.transaction();
  try {
    const [expense] = await Promise.all([
      await req.user.createExpense(
        {
          amount: amount,
          desc: desc,
          category: category,
        },
        { transaction: t }
      ),
      await req.user.update(
        {
          totalExpense: req.user.totalExpense + +amount,
        },
        { transaction: t }
      ),
    ]);
    t.commit();
    res.json(expense);
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.getExpenses = async (req, res, next) => {
  let page = req.params.id;
  page = +page;
  const ITEMS_PER_PAGE = +req.query.perPage;
  try {
    // const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const data = await req.user.getExpenses({
      attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "itemCount"]],
    });
    const totalItems = data[0].dataValues.itemCount;
    const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
    // console.log(lastPage);
    const expenses = await req.user.getExpenses({
      offset: (page - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
    });
    res.json({
      expenses: expenses,
      currentPage: page,
      isNextPage: page !== lastPage,
      isPreviousPage: page !== 1,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: lastPage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const id = req.params.id;
  const t = await sequelize.transaction();
  try {
    const expense = await req.user.getExpenses(
      { where: { id: id } },
      { transaction: t }
    );
    await req.user.update(
      {
        totalExpense: req.user.totalExpense - +expense[0].amount,
      },
      { transaction: t }
    );
    await expense[0].destroy({ transaction: t });
    t.commit();
    res.json({
      message: "Expense deleted",
    });
  } catch (err) {
    t.rollback();
    res.status(404).json({
      message: "Expense not found, try again",
    });
  }
};

const uploadToS3 = (data, file) => {
  const s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  });

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((res, rej) => {
    s3Bucket.upload(params, (err, response) => {
      if (err) {
        console.log("Something went wrong", err);
        rej(err);
      } else {
        res(response.Location);
      }
    });
  });
};

exports.downloadExpenses = async (req, res, next) => {
  try {
    if (req.user.isPremium) {
      try {
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = req.user.id;
        const fileName = `Expense-${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        const date = new Date().toISOString().slice(0, 10);
        await req.user.createFileDownload({
          fileUrl: fileUrl,
          date: date,
        });
        res.status(201).json({
          fileUrl,
          success: true,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          fileUrl: "",
          success: false,
          error: err,
        });
      }
    } else {
      throw new Error("Unauthorized User");
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: err,
    });
  }
};

exports.getFileDownloads = async (req, res, next) => {
  try {
    const files = await req.user.getFileDownloads({
      attributes: ["fileUrl", "createdAt"],
    });
    console.log(files);
    res.status(200).json({
      files: JSON.stringify(files),
    });
  } catch (err) {
    console.log(err);
  }
};
