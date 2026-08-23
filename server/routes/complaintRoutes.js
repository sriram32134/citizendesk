const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/uploadController");

const {
  raiseComplaint,
  getComplaintsByMobile,
  deleteComplaintByUser,
  updateUserFeedback,
  AnalyzeImage,
  UpdateComplaintData,
  FindLastEntered,
} = require("../controllers/complaintController");

/* Core */
router.post("/upload-image", uploadImage);
router.post("/raise", raiseComplaint);
router.get("/user/:mobile", getComplaintsByMobile);
router.delete("/:id", deleteComplaintByUser);
router.put("/update-user-feedback/:id", updateUserFeedback);

/* AI */
router.get("/last-complaint", FindLastEntered);
router.post("/analyze-image", AnalyzeImage);
router.put("/update-ai-data/:id", UpdateComplaintData);


module.exports = router;
