const express = require("express");

const userController = require("../middleware/auth");
const premiumController = require("../controllers/premium");

const router = express.Router();

router.get("/showLeaderboards", premiumController.getLeaderboards);

module.exports = router;
