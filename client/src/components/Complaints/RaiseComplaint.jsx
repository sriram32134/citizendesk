import React, { useState } from "react";
import { locationData } from "../../data/locations";
import axios from "axios";


const primary = "#0b3c5d";

function RaiseComplaint() {
  const [loading, setLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    district: "",
    mandal: "",
    village: "",
    description: "",
  });

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDistrictChange = (e) => {
    setFormData({
      ...formData,
      district: e.target.value,
      mandal: "",
    });
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setLocationError("Location permission denied")
    );
  };

  /* ---------------- Image Upload (Camera + File) ---------------- */

  const handleImageSelect = async (file) => {
    if (!file) return;

    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/upload-image`,
        { method: "POST", body: form }
      );

      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.message || "Image upload failed");
      setUploadedImageUrl(data.url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.mobile)) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    if (!uploadedImageUrl) {
      alert("Please upload an evidence image");
      return;
    }

    if (!location) {
      alert("Please capture your current location");
      return;
    }

    setLoading(true);

    try {
      /* ---------- STEP 1: CREATE COMPLAINT ---------- */
      const raiseRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/complaints/raise`,
        {
          ...formData,
          imageUrl: uploadedImageUrl,
          location,
        }
      );

      if (!raiseRes.data?.success) {
        throw new Error("Complaint creation failed");
      }

      const { _id, imageUrl } = raiseRes.data.data;

      /* ---------- STEP 2: ANALYZE IMAGE ---------- */
      try {
        const analyzeRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/complaints/analyze-image`,
          { imageUrl }
        );

        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/complaints/update-ai-data/${_id}`,
          analyzeRes.data
        );
      } catch (aiErr) {
        console.warn("AI failed, complaint still saved");
      }

      alert("🎉 Complaint submitted successfully!");

      setFormData({
        name: "",
        mobile: "",
        district: "",
        mandal: "",
        village: "",
        description: "",
      });
      setUploadedImageUrl("");
      setLocation(null);
      setLocationError("");
    } catch (err) {
        console.error("Submission failed:", err);
        if (err && err.response) {
          console.error("Response data:", err.response.data);
          alert(`Submission failed: ${err.response.status} ${err.response.statusText}`);
        } else {
          alert(`Submission failed: ${err.message || "Network/Unknown error"}`);
        }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="hero-section py-5">
      <div className="container">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#0D2C50" }}>
          Raise a Complaint
        </h2>

        <form className="row g-3" onSubmit={handleSubmit}>
          {/* NAME */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Your Name</label>
            <input
              type="text"
              name="name"
              className="form-control form-control-lg"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* MOBILE */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              className="form-control form-control-lg"
              value={formData.mobile}
              onChange={handleChange}
              maxLength="10"
              required
            />
          </div>

          {/* DISTRICT */}
          <div className="col-md-4">
            <label className="form-label fw-bold">District</label>
            <select
              name="district"
              className="form-select form-select-lg"
              value={formData.district}
              onChange={handleDistrictChange}
              required
            >
              <option value="">Select District</option>
              {Object.keys(locationData).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* MANDAL */}
          <div className="col-md-4">
            <label className="form-label fw-bold">Mandal</label>
            <select
              name="mandal"
              className="form-select form-select-lg"
              value={formData.mandal}
              onChange={handleChange}
              disabled={!formData.district}
              required
            >
              <option value="">Select Mandal</option>
              {formData.district &&
                locationData[formData.district].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
            </select>
          </div>

          {/* VILLAGE */}
          <div className="col-md-4">
            <label className="form-label fw-bold">Village Name</label>
            <input
              type="text"
              name="village"
              className="form-control form-control-lg"
              value={formData.village}
              onChange={handleChange}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="col-12">
            <label className="form-label fw-bold">Issue Description</label>
            <textarea
              name="description"
              rows="4"
              className="form-control form-control-lg"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* IMAGE UPLOAD (ONE INPUT ONLY) */}
          <div className="col-12">
            <label className="form-label fw-bold">Upload Evidence Image</label>
            <input
              type="file"
              accept="image/*"
              className="form-control form-control-lg"
              onChange={(e) => handleImageSelect(e.target.files[0])}
              required
            />

            {uploadedImageUrl && (
              <div className="mt-3 text-center">
                <img
                  src={uploadedImageUrl}
                  alt="Preview"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "250px" }}
                />
              </div>
            )}
          </div>

          {/* LOCATION */}
          <div className="col-12">
            <button
              type="button"
              className={`btn btn-lg w-100 ${
                location ? "btn-success" : "btn-outline-primary"
              }`}
              onClick={getLocation}
            >
              {location ? "GPS Location Captured ✓" : "Capture Current Location"}
            </button>
            {locationError && (
              <small className="text-danger d-block mt-1">
                {locationError}
              </small>
            )}
          </div>

          {/* SUBMIT */}
          <div className="col-12 d-grid mt-4">
            <button
              type="submit"
              className="btn btn-lg text-white"
              style={{ backgroundColor: primary }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Official Complaint"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default RaiseComplaint;
