const express = require("express");
const router = express.Router();
const tenderController = require("../controller/tender");
const verifyToken = require("../middleware/auth")

router.get("/all-tenders", tenderController.getAllTender);
router.get("/search", tenderController.search);
router.get("/advance-search", tenderController.advanceSearch);
router.post("/add-tender", tenderController.postAddTender);
router.get("/tender/:tenderId", tenderController.getSingleTender);
router.post("/tender/:tenderId/switchApprovedStatus", tenderController.switchStatus);
router.post("/tender/:tenderId/switchActiveStatus", tenderController.switchActive);

module.exports = router;