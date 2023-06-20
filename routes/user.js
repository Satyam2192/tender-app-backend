const express = require("express");
const router = express.Router();
const usersController = require("../controller/user");

router.get("/single-user", usersController.getSingleUser);

module.exports = router;
