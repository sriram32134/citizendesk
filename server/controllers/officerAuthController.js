const Officer = require("../models/Officer");

exports.loginOfficer = async (req, res) => {
  const { officerId, password } = req.body;

  try {
    // Look for officer in DB
    const officer = await Officer.findOne({ officerId });

    if (!officer || officer.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid Officer ID or Password" });
    }

    // Return officer data (including district/mandal so dashboard filters automatically)
    res.json({
      success: true,
      officer: {
        id: officer._id,
        name: officer.name,
        district: officer.district,
        mandal: officer.mandal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};