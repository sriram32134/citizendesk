const Complaint = require("../models/Complaint");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

/* --------------------------------------------------
   1️⃣ Raise Complaint (NO AI here anymore)
-------------------------------------------------- */
exports.raiseComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    const saved = await complaint.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("❌ Complaint error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------------------------
   2️⃣ Get complaints by mobile
-------------------------------------------------- */
exports.getComplaintsByMobile = async (req, res) => {
  try {
    const complaints = await Complaint.find({ mobile: req.params.mobile })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserFeedback = async (req, res) => {
  try {
    const { resolutionStatus } = req.body;

    if (!["SOLVED", "NO_ACTION"].includes(resolutionStatus)) {
      return res.status(400).json({ message: "Invalid resolution status" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "userFeedback.resolutionStatus": resolutionStatus,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ success: true, data: updated });
    console.log("✅ Feedback updated:", updated._id);
  } catch (error) {
    console.error("❌ Feedback update error:", error);
    res.status(500).json({ error: error.message });
  }
};


/* --------------------------------------------------
   3️⃣ Delete complaint
-------------------------------------------------- */
exports.deleteComplaintByUser = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* --------------------------------------------------
   4️⃣ Find last complaint
-------------------------------------------------- */
exports.FindLastEntered = async (req, res) => {
  try {
    const lastComplaint = await Complaint.findOne({})
      .sort({ createdAt: -1 });

    if (!lastComplaint)
      return res.status(404).json({ message: "No complaints found" });

    res.json({
      _id: lastComplaint._id,
      imageUrl: lastComplaint.imageUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* --------------------------------------------------
   5️⃣ Gemini Image Analysis (PURE AI)
-------------------------------------------------- */
exports.AnalyzeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const imgResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const base64Data = Buffer.from(imgResponse.data).toString("base64");
    const mimeType = imgResponse.headers["content-type"] || "image/jpeg";

    const prompt = `
Analyze this complaint image and return ONLY JSON:

{
  "department": "ROADS | ELECTRICITY | WATER_SUPPLY | SANITATION | OTHER",
  "urgency": "EMERGENCY | HIGH | MODERATE | LOW",
  "confidence": number,
  "reason": "short explanation"
}
`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } },
    ]);

    const aiData = JSON.parse(result.response.text());
    res.json(aiData);
    console.log(aiData);

  } catch (error) {
    res.status(500).json({ error: "AI Analysis failed", details: error.message });
    console.log(error);
  }
};

/* --------------------------------------------------
   6️⃣ Save Gemini AI result to DB
-------------------------------------------------- */
exports.UpdateComplaintData = async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        aiAnalysis: {
          department: req.body.department || "",
          urgency: req.body.urgency || "",
          confidence: req.body.confidence || 0,
          reason: req.body.reason || "",
        },
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
