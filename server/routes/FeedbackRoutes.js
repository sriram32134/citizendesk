const express = require("express");
const router = express.Router();

const{submitFeedback, getAllFeedback} = require("../controllers/feedbackController");


router.post("/submit-feedback", submitFeedback);
router.get("/get-all-feedbacks", getAllFeedback);

module.exports = router;