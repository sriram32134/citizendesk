// models/Complaint.js
const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  district: String,
  mandal: String,
  village: String,
  description: String,
  imageUrl: String,

  location: {
    lat: Number,
    lng: Number,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed"],
    default: "Pending",
  },

  // ✅ AI ANALYSIS (Gemini Only)
  aiAnalysis: {
    department: { type: String, default: "" },
    urgency: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    reason: { type: String, default: "" },
  },

  assignedWorker: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    dept: { type: String, default: "" },
  },

  // User-side resolution feedback
  userFeedback: {
    resolutionStatus: {
      type: String,
      default: ""
    }
  }
,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
