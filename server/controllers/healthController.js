// controllers/healthController.js
exports.healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Server is awake",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Health check error:", error.message);
    res.status(500).json({
      success: false,
      message: "Health check failed",
    });
  }
};
