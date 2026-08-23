const express = require("express");
const router = express.Router();
const { getAllFeedback } = require("../controllers/feedbackController");
const { loginOfficer } = require("../controllers/officerAuthController");
const {
  getComplaintsForOfficer,
  updateComplaintStatus,
  deleteComplaint
} = require("../controllers/officerComplaintController");

router.post("/login", loginOfficer);
router.get("/complaints", getComplaintsForOfficer);
router.put("/complaints/:id/status", updateComplaintStatus);
router.delete("/complaints/:id", deleteComplaint);

// New Officer Feedback View Route
router.get("/feedback", getAllFeedback);

module.exports = router;