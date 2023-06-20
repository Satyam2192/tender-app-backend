const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact");

router.post("/post-contactform", contactController.postContactForm);
router.get("/get-allcontactforms", contactController.getContactForms);

module.exports = router;
